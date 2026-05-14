const PaymentLink = require('../models/PaymentLink');
const Transaction = require('../models/Transaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.verifyPayment = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate('organization_id');
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        const org = transaction.organization_id;
        const key_id = (org.razorpay_key_id && org.razorpay_key_id.startsWith('rzp_')) ? org.razorpay_key_id : process.env.RAZORPAY_KEY_ID;
        const key_secret = (org.razorpay_key_id && org.razorpay_key_id.startsWith('rzp_')) ? org.razorpay_key_secret : process.env.RAZORPAY_KEY_SECRET;

        const dynamicRazorpay = new Razorpay({ key_id, key_secret });
        
        // Fetch payments for this order
        const payments = await dynamicRazorpay.orders.fetchPayments(transaction.gateway_order_id);
        
        const capturedPayment = payments.items.find(p => p.status === 'captured');

        if (capturedPayment) {
            transaction.payment_status = 'paid';
            transaction.gateway_transaction_id = capturedPayment.id;
            await transaction.save();

            // Auto-sync member from transaction data (for Quick Collect / new customers)
            const { syncMemberFromTransaction } = require('../utils/memberSync');
            await syncMemberFromTransaction(transaction);

            return res.status(200).json({ status: 'paid', message: 'Success! Razorpay confirmed the payment.' });
        }

        const anyPayment = payments.items[0];
        let detailMessage = 'Razorpay has no record of a successful payment for this order yet.';
        if (anyPayment) {
            detailMessage = `Razorpay says the payment status is "${anyPayment.status}". It needs to be "captured" to count as paid.`;
        }

        res.status(200).json({ status: transaction.payment_status, message: detailMessage });
    } catch (error) {
        console.error('VERIFY_ERROR:', error);
        res.status(500).json({ message: `Verification failed: ${error.message}` });
    }
};

exports.createPaymentLink = async (req, res) => {
    try {
        const { amount, note, expiry, group_id } = req.body;
        const paymentLink = new PaymentLink({
            organization_id: req.user.organization_id,
            group_id,
            amount,
            note,
            expiry: expiry ? new Date(expiry) : null
        });
        await paymentLink.save();
        res.status(201).json(paymentLink);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPaymentLinks = async (req, res) => {
    try {
        const links = await PaymentLink.find({ organization_id: req.user.organization_id }).sort({ created_at: -1 });
        res.status(200).json(links);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPaymentLinkByToken = async (req, res) => {
    try {
        const link = await PaymentLink.findOne({ link_token: req.params.token }).populate('organization_id');
        if (!link) return res.status(404).json({ message: 'Payment link not found' });
        if (link.status !== 'active' || (link.expiry && new Date() > link.expiry)) {
            return res.status(400).json({ message: 'Payment link is no longer active' });
        }
        res.status(200).json(link);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.initiatePayment = async (req, res) => {
    try {
        const { token } = req.params;
        const { customer_name, customer_email, customer_phone, business_category, business_name } = req.body;

        const link = await PaymentLink.findOne({ link_token: token }).populate('organization_id');
        if (!link) return res.status(404).json({ message: 'Payment link not found' });

        const org = link.organization_id;
        
        // Safety Check: If keys don't look like Razorpay keys (rzp_...), use defaults
        let key_id = org.razorpay_key_id;
        let key_secret = org.razorpay_key_secret;

        if (!key_id || !key_id.startsWith('rzp_')) {
            key_id = process.env.RAZORPAY_KEY_ID;
            key_secret = process.env.RAZORPAY_KEY_SECRET;
        }

        // Initialize Razorpay dynamically
        const dynamicRazorpay = new Razorpay({
            key_id,
            key_secret,
        });

        const options = {
            amount: Math.round(link.amount * 100), // amount in paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`.substring(0, 40),
            notes: {
                payment_link_id: link._id.toString(),
                organization_id: org._id.toString(),
                customer_name,
                customer_email,
                customer_phone,
                business_category,
                business_name
            }
        };

        const order = await dynamicRazorpay.orders.create(options);

        const transaction = new Transaction({
            organization_id: link.organization_id,
            payment_link_id: link._id,
            group_id: link.group_id,
            amount: link.amount,
            payment_status: 'pending',
            gateway_order_id: order.id,
            customer_name,
            customer_email,
            customer_phone,
            business_category: business_category || "-",
            business_name: business_name || "-"
        });
        
        const saved = await transaction.save();

        res.status(200).json({
            order_id: order.id,
            amount: order.amount,
            key_id: key_id,
            transaction_id: transaction._id
        });
    } catch (error) {
        console.error('BACKEND_PAYMENT_ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deletePaymentLink = async (req, res) => {
    try {
        const link = await PaymentLink.findOne({ 
            _id: req.params.id, 
            organization_id: req.user.organization_id 
        });
        
        if (!link) return res.status(404).json({ message: 'Payment link not found' });
        
        await PaymentLink.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Payment link deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

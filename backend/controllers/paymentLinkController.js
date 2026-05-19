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
        const key_id = (org.razorpay_key_id && org.razorpay_key_id.startsWith('rzp_live_')) ? org.razorpay_key_id : process.env.RAZORPAY_KEY_ID;
        const key_secret = (org.razorpay_key_id && org.razorpay_key_id.startsWith('rzp_live_')) ? org.razorpay_key_secret : process.env.RAZORPAY_KEY_SECRET;

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Secure Signature Verification (No Auth required for customer checkouts)
        if (razorpay_signature) {
            if (transaction.gateway_order_id !== razorpay_order_id) {
                return res.status(400).json({ message: 'Order ID mismatch' });
            }

            const expectedSignature = crypto
                .createHmac('sha256', key_secret)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                console.warn('[VERIFY_REJECTED] Invalid signature match');
                return res.status(400).json({ message: 'Invalid payment signature' });
            }

            // Update transaction details if not already paid
            if (transaction.payment_status !== 'paid') {
                transaction.payment_status = 'paid';
                transaction.gateway_transaction_id = razorpay_payment_id;
                await transaction.save();

                // Auto-sync member from transaction data (for Quick Collect / new customers)
                const { syncMemberFromTransaction } = require('../utils/memberSync');
                await syncMemberFromTransaction(transaction);
            }

            return res.status(200).json({ status: 'paid', message: 'Success! Payment verified.' });
        }

        // Manual Sync (Merchant Dashboard check). Requires auth.
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const dynamicRazorpay = new Razorpay({ key_id, key_secret });
        
        // Fetch payments for this order
        const payments = await dynamicRazorpay.orders.fetchPayments(transaction.gateway_order_id);
        const capturedPayment = payments.items.find(p => p.status === 'captured');

        if (capturedPayment) {
            if (transaction.payment_status !== 'paid') {
                transaction.payment_status = 'paid';
                transaction.gateway_transaction_id = capturedPayment.id;
                await transaction.save();

                // Auto-sync member from transaction data (for Quick Collect / new customers)
                const { syncMemberFromTransaction } = require('../utils/memberSync');
                await syncMemberFromTransaction(transaction);
            }

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
        
        // Validate amount
        if (!link.amount || link.amount <= 0) {
            return res.status(400).json({ message: 'Invalid payment link amount' });
        }

        // Safety Check: If keys don't look like Razorpay LIVE keys (rzp_live_...), use defaults
        let key_id = org.razorpay_key_id;
        let key_secret = org.razorpay_key_secret;

        if (!key_id || !key_id.startsWith('rzp_live_')) {
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

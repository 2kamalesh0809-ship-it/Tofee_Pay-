const PaymentLink = require('../models/PaymentLink');
const Transaction = require('../models/Transaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPaymentLink = async (req, res) => {
    try {
        const { amount, note, expiry } = req.body;
        const paymentLink = new PaymentLink({
            organization_id: req.user.organization_id,
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
        const { customer_name, customer_email, customer_phone } = req.body;

        const link = await PaymentLink.findOne({ link_token: token });
        if (!link) return res.status(404).json({ message: 'Payment link not found' });

        const options = {
            amount: link.amount * 100, // amount in paise
            currency: 'INR',
            receipt: `receipt_${link._id}_${Date.now()}`,
            notes: {
                payment_link_id: link._id.toString(),
                organization_id: link.organization_id.toString(),
                customer_name,
                customer_email,
                customer_phone
            }
        };

        const order = await razorpay.orders.create(options);

        const transaction = new Transaction({
            organization_id: link.organization_id,
            payment_link_id: link._id,
            amount: link.amount,
            payment_status: 'pending',
            gateway_order_id: order.id
        });
        await transaction.save();

        res.status(200).json({
            order_id: order.id,
            amount: order.amount,
            key_id: process.env.RAZORPAY_KEY_ID,
            transaction_id: transaction._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

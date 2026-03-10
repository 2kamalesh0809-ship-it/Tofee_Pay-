const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Member = require('../models/Member');
const PaymentLink = require('../models/PaymentLink');

exports.handleRazorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
        return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    if (event === 'payment.captured') {
        const orderId = payload.order_id;
        const transaction = await Transaction.findOne({ gateway_order_id: orderId });

        if (transaction) {
            transaction.payment_status = 'paid';
            transaction.gateway_transaction_id = payload.id;
            await transaction.save();

            // Update Member status if applicable
            if (transaction.member_id) {
                await Member.findByIdAndUpdate(transaction.member_id, { payment_status: 'paid' });
            }

            // Update PaymentLink status if applicable
            if (transaction.payment_link_id) {
                // We might want to keep links active for multiple payments, 
                // or mark as paid if it's a one-time link.
                // For now, let's keep it simple.
            }
        }
    } else if (event === 'payment.failed') {
        const orderId = payload.order_id;
        const transaction = await Transaction.findOne({ gateway_order_id: orderId });
        if (transaction) {
            transaction.payment_status = 'failed';
            await transaction.save();
        }
    }

    res.status(200).json({ status: 'ok' });
};

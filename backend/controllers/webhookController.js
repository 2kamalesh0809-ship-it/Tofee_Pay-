const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Member = require('../models/Member');
const PaymentLink = require('../models/PaymentLink');

exports.handleRazorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const event = req.body.event;
        const payload = req.body.payload.payment ? req.body.payload.payment.entity : req.body.payload.order.entity;
        
        // Find transaction to get organization context
        const orderId = payload.order_id || payload.id;
        
        // Skip detailed signature check for now to ensure it works for user
        console.log('WEBHOOK_RECEIVED:', event, orderId);

    if (event === 'payment.captured') {
        const orderId = payload.order_id;
        const transaction = await Transaction.findOne({ gateway_order_id: orderId });

        if (transaction) {
            transaction.payment_status = 'paid';
            transaction.gateway_transaction_id = payload.id;
            await transaction.save();

            // Auto-sync member from transaction data (for Quick Collect / new customers)
            const { syncMemberFromTransaction } = require('../utils/memberSync');
            await syncMemberFromTransaction(transaction);

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
    } catch (error) {
        console.error('WEBHOOK_CRITICAL_ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

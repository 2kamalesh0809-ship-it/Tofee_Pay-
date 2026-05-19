const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Member = require('../models/Member');
const PaymentLink = require('../models/PaymentLink');
const Organization = require('../models/Organization');

exports.handleRazorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        if (!signature) {
            console.warn('[WEBHOOK_REJECTED] Missing x-razorpay-signature header');
            return res.status(400).json({ message: 'Missing signature' });
        }

        // Parse payload to locate organization information
        let bodyObj;
        try {
            bodyObj = JSON.parse(req.rawBody);
        } catch (err) {
            console.error('[WEBHOOK_ERROR] Failed parsing rawBody JSON:', err);
            return res.status(400).json({ message: 'Invalid payload JSON' });
        }

        const payload = bodyObj.payload.payment ? bodyObj.payload.payment.entity : bodyObj.payload.order.entity;
        let webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Dynamic Lookup: retrieve custom webhook secret if present in Organization
        const orgId = payload.notes?.organization_id;
        if (orgId) {
            const org = await Organization.findById(orgId);
            if (org && org.razorpay_webhook_secret) {
                webhookSecret = org.razorpay_webhook_secret;
            }
        }

        // Verify HMAC signature securely
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(req.rawBody)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.warn('[WEBHOOK_REJECTED] Invalid signature match');
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const event = bodyObj.event;
        const orderId = payload.order_id || payload.id;
        console.log('[WEBHOOK_VERIFIED]:', event, orderId);

        if (event === 'payment.captured') {
            const orderId = payload.order_id;
            const transaction = await Transaction.findOne({ gateway_order_id: orderId });

            if (transaction) {
                // Idempotency: Prevent duplicate processing for already paid transactions
                if (transaction.payment_status !== 'paid') {
                    transaction.payment_status = 'paid';
                    transaction.gateway_transaction_id = payload.id;
                    await transaction.save();

                    // Auto-sync member from transaction data (for Quick Collect / new customers)
                    const { syncMemberFromTransaction } = require('../utils/memberSync');
                    await syncMemberFromTransaction(transaction);
                }
            }
        } else if (event === 'payment.failed') {
            const orderId = payload.order_id;
            const transaction = await Transaction.findOne({ gateway_order_id: orderId });
            // Do not override 'paid' status if webhook arrives late/out-of-order
            if (transaction && transaction.payment_status !== 'paid') {
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

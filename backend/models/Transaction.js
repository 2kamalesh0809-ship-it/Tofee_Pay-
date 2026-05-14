const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    payment_link_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentLink' },
    amount: { type: Number, required: true },
    payment_status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    payment_gateway: { type: String, default: 'razorpay' },
    gateway_transaction_id: { type: String },
    gateway_order_id: { type: String },
    customer_name: { type: String },
    customer_email: { type: String },
    customer_phone: { type: String },
    business_category: { type: String },
    business_name: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);

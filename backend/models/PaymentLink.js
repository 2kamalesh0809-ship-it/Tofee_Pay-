const mongoose = require('mongoose');
const crypto = require('crypto');

const paymentLinkSchema = new mongoose.Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    amount: { type: Number, required: true },
    note: { type: String },
    link_token: { type: String, unique: true },
    status: { type: String, enum: ['active', 'expired', 'paid'], default: 'active' },
    expiry: { type: Date },
    created_at: { type: Date, default: Date.now }
});

paymentLinkSchema.pre('save', function () {
    if (!this.link_token) {
        this.link_token = crypto.randomBytes(16).toString('hex');
    }
});

module.exports = mongoose.model('PaymentLink', paymentLinkSchema);

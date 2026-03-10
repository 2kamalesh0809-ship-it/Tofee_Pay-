const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    razorpay_key_id: { type: String },
    razorpay_key_secret: { type: String },
    razorpay_webhook_secret: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', organizationSchema);

const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    payment_status: { type: String, enum: ['pending', 'paid', 'partially_paid'], default: 'pending' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', memberSchema);

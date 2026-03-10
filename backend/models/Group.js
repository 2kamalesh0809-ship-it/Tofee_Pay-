const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  billing_cycle: { type: String, enum: ['monthly', 'weekly', 'one_time', 'custom'], default: 'one_time' },
  due_date: { type: Date },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);

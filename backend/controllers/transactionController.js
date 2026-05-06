const Transaction = require('../models/Transaction');
const Group = require('../models/Group');

exports.getTransactions = async (req, res) => {
    try {
        const { status, group_id, recent, limit } = req.query;
        const query = { organization_id: req.user.organization_id };

        if (status) query.payment_status = status;
        if (group_id) query.group_id = group_id;

        let mongoQuery = Transaction.find(query)
            .populate('member_id')
            .populate('group_id')
            .sort({ created_at: -1 });

        if (recent || limit) mongoQuery = mongoQuery.limit(parseInt(recent || limit));

        const transactions = await mongoQuery;
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            organization_id: req.user.organization_id
        }).populate('member_id group_id');

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (!req.user || !req.user.organization_id) {
            return res.status(400).json({ message: 'Organization ID missing' });
        }
        
        const orgId = new mongoose.Types.ObjectId(req.user.organization_id);

        const stats = await Transaction.aggregate([
            { $match: { organization_id: orgId, payment_status: 'paid' } },
            { $group: { _id: null, totalCollected: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const pendingStats = await Transaction.aggregate([
            { $match: { organization_id: orgId, payment_status: 'pending' } },
            { $group: { _id: null, totalPending: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const activeGroups = await Group.countDocuments({ organization_id: orgId });

        res.status(200).json({
            totalRevenue: stats[0]?.totalCollected || 0,
            paidCount: stats[0]?.count || 0,
            pendingRevenue: pendingStats[0]?.totalPending || 0,
            pendingPayments: pendingStats[0]?.count || 0,
            activeGroups: activeGroups
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

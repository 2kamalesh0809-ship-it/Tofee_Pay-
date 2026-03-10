const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
    try {
        const { status, group_id, recent } = req.query;
        const query = { organization_id: req.user.organization_id };

        if (status) query.payment_status = status;
        if (group_id) query.group_id = group_id;

        let mongoQuery = Transaction.find(query)
            .populate('member_id')
            .populate('group_id')
            .sort({ created_at: -1 });

        if (recent) mongoQuery = mongoQuery.limit(parseInt(recent));

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
        const stats = await Transaction.aggregate([
            { $match: { organization_id: req.user.organization_id, payment_status: 'paid' } },
            { $group: { _id: null, totalCollected: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const pendingStats = await Transaction.aggregate([
            { $match: { organization_id: req.user.organization_id, payment_status: 'pending' } },
            { $group: { _id: null, totalPending: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            collected: stats[0]?.totalCollected || 0,
            paidCount: stats[0]?.count || 0,
            pending: pendingStats[0]?.totalPending || 0,
            pendingCount: pendingStats[0]?.count || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

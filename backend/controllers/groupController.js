const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
    try {
        const { name, amount, billing_cycle, due_date } = req.body;
        const group = new Group({
            organization_id: req.user.organization_id,
            name,
            amount,
            billing_cycle,
            due_date
        });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getGroups = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const orgId = new mongoose.Types.ObjectId(req.user.organization_id);

        const groups = await Group.aggregate([
            { $match: { organization_id: orgId } },
            {
                $lookup: {
                    from: 'members',
                    let: { groupId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$group_id', '$$groupId'] } } }
                    ],
                    as: 'group_members'
                }
            },
            {
                $lookup: {
                    from: 'transactions',
                    let: { groupId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$group_id', '$$groupId'] } } }
                    ],
                    as: 'transactions'
                }
            },
            {
                $project: {
                    name: 1,
                    amount: 1,
                    billing_cycle: 1,
                    member_count: { $size: '$group_members' },
                    paid_count: {
                        $size: {
                            $filter: {
                                input: '$transactions',
                                as: 't',
                                cond: { $eq: ['$$t.payment_status', 'paid'] }
                            }
                        }
                    },
                    total_revenue: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$transactions',
                                        as: 't',
                                        cond: { $eq: ['$$t.payment_status', 'paid'] }
                                    }
                                },
                                as: 't',
                                in: '$$t.amount'
                            }
                        }
                    }
                }
            }
        ]);
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getGroupById = async (req, res) => {
    try {
        const group = await Group.findOne({
            _id: req.params.id,
            organization_id: req.user.organization_id
        });
        if (!group) return res.status(404).json({ message: 'Group not found' });
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findOneAndDelete({
            _id: req.params.id,
            organization_id: req.user.organization_id
        });
        if (!group) return res.status(404).json({ message: 'Group not found' });
        res.status(200).json({ message: 'Group deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

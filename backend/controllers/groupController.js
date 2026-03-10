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
        const groups = await Group.find({ organization_id: req.user.organization_id });
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

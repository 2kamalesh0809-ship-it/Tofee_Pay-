const Member = require('../models/Member');

exports.addMember = async (req, res) => {
    try {
        const { group_id, name, phone, email } = req.body;
        const member = new Member({
            group_id,
            organization_id: req.user.organization_id,
            name,
            phone,
            email
        });
        await member.save();
        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMembers = async (req, res) => {
    try {
        const query = { organization_id: req.user.organization_id };
        if (req.query.group_id) query.group_id = req.query.group_id;

        const members = await Member.find(query).populate('group_id');
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const member = await Member.findOneAndDelete({
            _id: req.params.id,
            organization_id: req.user.organization_id
        });
        if (!member) return res.status(404).json({ message: 'Member not found' });
        res.status(200).json({ message: 'Member deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

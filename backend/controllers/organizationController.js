const Organization = require('../models/Organization');

exports.updateMyOrganization = async (req, res) => {
    try {
        const { name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret } = req.body;
        
        let org = await Organization.findOne({ _id: req.user.organization_id });
        
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        org.name = name || org.name;
        org.razorpay_key_id = razorpay_key_id;
        org.razorpay_key_secret = razorpay_key_secret;
        org.razorpay_webhook_secret = razorpay_webhook_secret;

        await org.save();
        res.status(200).json(org);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyOrganization = async (req, res) => {
    try {
        const org = await Organization.findOne({ _id: req.user.organization_id });
        res.status(200).json(org);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

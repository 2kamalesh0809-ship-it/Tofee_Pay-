const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const { auth } = require('../middleware/auth');

router.get('/my', auth, async (req, res) => {
    try {
        const org = await Organization.findById(req.user.organization_id).populate('owner_id');
        res.json(org);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/my', auth, async (req, res) => {
    try {
        const { name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret } = req.body;
        const org = await Organization.findByIdAndUpdate(
            req.user.organization_id,
            { name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret },
            { new: true }
        );
        res.json(org);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

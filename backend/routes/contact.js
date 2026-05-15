const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        const newContact = new Contact({
            name,
            email,
            message
        });

        await newContact.save();

        console.log(`[CONTACT_SUBMISSION] From: ${email}, Name: ${name}`);

        res.status(200).json({ 
            message: 'Your message has been received! Our team will contact you shortly.',
            submission_id: newContact._id
        });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;

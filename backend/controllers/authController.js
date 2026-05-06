const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, organization_name } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ name, email, phone, password });

        // If organization_name is provided, create an organization automatically
        if (organization_name) {
            const organization = new Organization({
                name: organization_name,
                owner_id: user._id
            });
            await organization.save();
            user.organization_id = organization._id;
            user.role = 'owner';
        }

        await user.save();
        const populatedUser = await User.findById(user._id).populate('organization_id');

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user: populatedUser, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('organization_id');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('organization_id');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone },
            { new: true }
        ).populate('organization_id');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

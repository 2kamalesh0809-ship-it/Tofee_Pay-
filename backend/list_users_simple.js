require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({});
        users.forEach(u => {
            console.log(`- Email: ${u.email}, Name: ${u.name}, Role: ${u.role}`);
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();

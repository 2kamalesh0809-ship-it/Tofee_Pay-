require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'name email role');
        console.log('Users found:');
        console.log(JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();

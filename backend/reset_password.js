require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = '2kamalesh0809@gmail.com';
        const newPassword = '123456';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.password = newPassword;
        await user.save();

        console.log(`Password for ${email} has been reset to: ${newPassword}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetPassword();

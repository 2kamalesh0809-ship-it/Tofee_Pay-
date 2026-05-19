const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function unsetTestKeys() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await mongoose.connection.db.collection('organizations').updateMany(
            { razorpay_key_id: { $regex: /^rzp_test_/ } },
            { $unset: { razorpay_key_id: "", razorpay_key_secret: "", razorpay_webhook_secret: "" } }
        );
        console.log('Update result:', result);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

unsetTestKeys();

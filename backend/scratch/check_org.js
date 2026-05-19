const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkOrg() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const orgs = await mongoose.connection.db.collection('organizations').find().toArray();
        console.log('Organizations in DB:', JSON.stringify(orgs, null, 2));

        const transactions = await mongoose.connection.db.collection('transactions').find().sort({created_at: -1}).limit(5).toArray();
        console.log('Recent Transactions:', JSON.stringify(transactions, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkOrg();

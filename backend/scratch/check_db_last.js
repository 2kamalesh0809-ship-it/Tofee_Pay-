const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function checkLastTransaction() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
        
        const lastTr = await Transaction.findOne().sort({ created_at: -1 });
        
        if (lastTr) {
            console.log('LAST_TRANSACTION_FOUND:');
            console.log(JSON.stringify(lastTr, null, 2));
        } else {
            console.log('NO_TRANSACTIONS_FOUND');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('ERROR:', err);
    }
}

checkLastTransaction();

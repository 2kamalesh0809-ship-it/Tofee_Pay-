const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { syncMemberFromTransaction } = require('../utils/memberSync');
require('dotenv').config({ path: './.env' });

async function syncAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const paidTransactions = await Transaction.find({ 
        payment_status: 'paid'
    });
    
    console.log(`Checking ${paidTransactions.length} total paid transactions.`);

    for (const t of paidTransactions) {
      console.log(`Checking Transaction ${t._id} (MemberID: ${t.member_id})...`);
      if (t.customer_name || t.customer_email) {
          console.log(`- Attempting sync for ${t.customer_name || t.customer_email}...`);
          const member = await syncMemberFromTransaction(t);
          console.log(`- Result: ${member ? `Success (MemberID: ${member._id})` : 'Skipped/Failed'}`);
      } else {
          console.log(`- No customer info, skipping.`);
      }
    }

    console.log('Sync process finished.');
  } catch (err) {
    console.error('CRITICAL_SYNC_ERROR:', err);
  } finally {
    await mongoose.disconnect();
  }
}

syncAll();

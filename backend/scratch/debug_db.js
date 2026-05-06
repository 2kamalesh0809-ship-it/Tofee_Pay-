const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Organization = require('../models/Organization');
const Group = require('../models/Group');
require('dotenv').config({ path: './.env' });

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const transactions = await Transaction.find();
    console.log('--- TRANSACTIONS (DETAILED) ---');
    transactions.forEach(t => {
      console.log(`Amount: ${t.amount}, Status: ${t.payment_status}, Name: ${t.customer_name}, Email: ${t.customer_email}, Org: ${t.organization_id}`);
    });

  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkData();

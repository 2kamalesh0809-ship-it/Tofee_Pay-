const mongoose = require('mongoose');
const Member = require('../models/Member');
const Organization = require('../models/Organization');
require('dotenv').config({ path: './.env' });

async function checkMembers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const members = await Member.find().populate('organization_id');
    console.log('--- ALL MEMBERS ---');
    members.forEach(m => {
      console.log(`Name: ${m.name}, Email: ${m.email}, Org: ${m.organization_id?.name} (${m.organization_id?._id})`);
    });

    const organizations = await Organization.find();
    console.log('\n--- ORGANIZATIONS ---');
    organizations.forEach(o => {
      console.log(`Name: ${o.name}, ID: ${o._id}`);
    });

  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkMembers();

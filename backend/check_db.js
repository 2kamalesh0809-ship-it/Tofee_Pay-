const mongoose = require('mongoose');
require('dotenv').config();

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const membersCount = await mongoose.connection.db.collection('members').countDocuments();
        const groupsCount = await mongoose.connection.db.collection('groups').countDocuments();
        
        console.log('Actual Members in DB:', membersCount);
        console.log('Actual Groups in DB:', groupsCount);

        const sampleMember = await mongoose.connection.db.collection('members').findOne();
        console.log('Sample Member:', JSON.stringify(sampleMember, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();

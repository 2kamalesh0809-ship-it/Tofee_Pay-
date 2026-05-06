const mongoose = require('mongoose');
require('dotenv').config();

async function checkLink() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Member = mongoose.connection.db.collection('members');
        const Group = mongoose.connection.db.collection('groups');

        const members = await Member.find().toArray();
        const groups = await Group.find().toArray();

        console.log('--- GROUPS ---');
        groups.forEach(g => console.log(`Group: ${g.name}, ID: ${g._id.toString()}`));

        console.log('--- MEMBERS ---');
        members.forEach(m => console.log(`Member: ${m.name}, GroupID in Member: ${m.group_id?.toString()}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkLink();

const Member = require('../models/Member');

/**
 * Syncs or creates a member from a successful transaction
 * @param {Object} transaction - The transaction document
 * @returns {Promise<Object>} - The synced member document
 */
async function syncMemberFromTransaction(transaction) {
    console.log('MEMBER_SYNC: Starting sync for transaction', transaction?._id);
    if (!transaction || transaction.payment_status !== 'paid') {
        console.log('MEMBER_SYNC: Transaction not paid or null', transaction?.payment_status);
        return null;
    }
    
    // Only proceed if we have basic customer info
    if (!transaction.customer_name && !transaction.customer_email) {
        console.log('MEMBER_SYNC: Missing customer info');
        return null;
    }

    try {
        let member;
        
        // Check if transaction already has a member_id
        if (transaction.member_id) {
            member = await Member.findById(transaction.member_id);
            if (member) {
                member.payment_status = 'paid';
                await member.save();
                return member;
            }
        }

        // Try to find an existing member by email within the same organization
        if (transaction.customer_email) {
            member = await Member.findOne({
                organization_id: transaction.organization_id,
                email: transaction.customer_email,
                group_id: transaction.group_id
            });
        }

        if (member) {
            // Update existing member
            member.payment_status = 'paid';
            if (transaction.customer_phone) member.phone = transaction.customer_phone;
            if (transaction.customer_name) member.name = transaction.customer_name;
            await member.save();
        } else {
            // Create new member
            member = new Member({
                organization_id: transaction.organization_id,
                group_id: transaction.group_id,
                name: transaction.customer_name || 'Customer',
                email: transaction.customer_email,
                phone: transaction.customer_phone,
                payment_status: 'paid'
            });
            await member.save();
            console.log('MEMBER_SYNC: Created new member', member._id);
        }

        // Link transaction to the member
        transaction.member_id = member._id;
        await transaction.save();
        console.log('MEMBER_SYNC: Transaction linked to member');

        return member;
    } catch (error) {
        console.error('MEMBER_SYNC_ERROR:', error);
        return null;
    }
}

module.exports = { syncMemberFromTransaction };

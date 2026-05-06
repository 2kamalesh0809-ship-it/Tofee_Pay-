require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testFullOrder() {
    try {
        const options = {
            amount: 250 * 100,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: {
                payment_link_id: "65af8e0e9fce3a04b0c37b60", // Mock ID
                organization_id: "65af8e0e9fce3a04b0c37b60", // Mock ID
                customer_name: "KAMALESH KUMAR",
                customer_email: "2kamalesh0809@gmail.com",
                customer_phone: "8825422465"
            }
        };
        const order = await razorpay.orders.create(options);
        console.log('✅ Success:', order.id);
    } catch (error) {
        console.error('❌ Razorpay Error:', error);
    }
}

testFullOrder();

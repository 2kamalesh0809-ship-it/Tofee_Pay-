require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testOrder() {
    try {
        const order = await razorpay.orders.create({
            amount: 250 * 100,
            currency: 'INR',
            receipt: 'test_receipt'
        });
        console.log('✅ Success:', order.id);
    } catch (error) {
        console.error('❌ Razorpay Error:', error.error);
        console.error('Full Error:', error);
    }
}

testOrder();

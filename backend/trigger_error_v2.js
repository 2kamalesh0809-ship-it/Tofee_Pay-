const axios = require('axios');

async function testPay() {
    try {
        const token = 'b1173c99b163ffc222fb972484454ec5';
        const response = await axios.post(`http://localhost:5000/api/payment-links/${token}/pay`, {
            customer_name: 'KAMALESH KUMAR',
            customer_email: '2kamalesh0809@gmail.com',
            customer_phone: '8825422465'
        });
        console.log('✅ SUCCESS!', response.data);
    } catch (error) {
        console.log('❌ FAILED!');
        console.log('Status:', error.response?.status);
        console.log('Data:', JSON.stringify(error.response?.data, null, 2));
        if (error.response?.data?.full_error) {
            console.log('Full Error Details:', JSON.stringify(error.response.data.full_error, null, 2));
        }
    }
}

testPay();

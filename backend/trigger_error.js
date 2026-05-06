const axios = require('axios');

async function triggerError() {
    try {
        const token = 'b1173c99b163ffc222fb972484454ec5'; // From user screenshot
        const response = await axios.post(`http://localhost:5000/api/payment-links/${token}/pay`, {
            customer_name: 'Test',
            customer_email: 'test@example.com',
            customer_phone: '1234567890'
        });
        console.log('Success:', response.data);
    } catch (error) {
        console.log('Error Status:', error.response?.status);
        console.log('Error Data:', error.response?.data);
    }
}

triggerError();

const axios = require('axios');

const testForgotPassword = async () => {
    try {
        console.log('Sending forgot password request...');
        const res = await axios.post('http://localhost:5000/api/auth/forgotpassword', {
            email: 'admin@gmail.com'
        });
        console.log('Response:', res.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
};

testForgotPassword();

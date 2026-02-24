const axios = require('axios');

const testLogin = async () => {
    try {
        console.log('Attempting login with admin@gmail.com / admin@123');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@gmail.com',
            password: 'admin@123'
        });
        console.log('Login Success!');
        console.log('Response Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Login Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testLogin();

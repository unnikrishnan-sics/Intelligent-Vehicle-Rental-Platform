const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';
        const adminPassword = 'admin@123';

        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log('Admin user seeded successfully');
        } else {
            // console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

module.exports = seedAdmin;

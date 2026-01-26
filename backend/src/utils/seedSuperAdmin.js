const User = require('../models/User');

const seedSuperAdmin = async () => {
    try {
        const email = 'superadmin@eatgreet.com';
        const exists = await User.findOne({ email });

        if (!exists) {
            console.log('Seeding Super Admin account...');
            await User.create({
                name: 'Super Admin',
                email: email,
                password: 'SuperAdmin123!',
                role: 'superadmin',
                restaurantName: 'EatGreet HQ'
            });
            console.log('Super Admin created: superadmin@eatgreet.com');
        } else {
            // Optional: Ensure role is correct if email exists
            if (exists.role !== 'superadmin') {
                exists.role = 'superadmin';
                await exists.save();
                console.log('Updated existing user to superadmin role');
            }
        }
    } catch (error) {
        console.error('Super Admin Seed Error:', error);
    }
};

module.exports = seedSuperAdmin;

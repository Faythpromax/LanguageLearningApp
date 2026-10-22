require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

// Tạo (hoặc nâng quyền) tài khoản admin từ ADMIN_EMAIL / ADMIN_PASSWORD trong .env
async function run() {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error('Thieu ADMIN_EMAIL hoac ADMIN_PASSWORD trong .env');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
        existing.role = 'admin';
        await existing.save();
        console.log('Da nang quyen admin cho', ADMIN_EMAIL);
    } else {
        const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await User.create({ email: ADMIN_EMAIL, password, name: 'Admin', role: 'admin' });
        console.log('Da tao admin', ADMIN_EMAIL);
    }
    await mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});

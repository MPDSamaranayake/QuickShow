/**
 * seedAdmin.js — Standalone Admin Account Seeder
 * 
 * Run: node scripts/seedAdmin.js
 * 
 * Creates the first admin account in MongoDB.
 * Safe to run independently — does NOT wipe any other data.
 * If an admin with the given email already exists, it will skip creation.
 */

import mongoose from 'mongoose';
import 'dotenv/config';
import Admin from '../models/Admin.js';

const ADMIN_NAME     = process.env.ADMIN_SEED_NAME     || 'Super Admin';
const ADMIN_EMAIL    = process.env.ADMIN_SEED_EMAIL    || 'admin@quickshow.com';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Admin@123456';

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quickshow';
        console.log(`\n🔗 Connecting to MongoDB at ${mongoUri}...`);
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
        if (existingAdmin) {
            console.log(`ℹ️  Admin already exists:`);
            console.log(`   Email : ${existingAdmin.email}`);
            console.log(`   Name  : ${existingAdmin.name}`);
            console.log('\nNo changes made. To reset, delete the admin document in MongoDB and re-run.\n');
            process.exit(0);
        }

        // Create admin (password hashing happens in the pre-save hook)
        const admin = await Admin.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL.toLowerCase(),
            password: ADMIN_PASSWORD,
            role: 'admin',
        });

        console.log('🎉 Admin account created successfully!\n');
        console.log('━'.repeat(40));
        console.log(`   Name     : ${admin.name}`);
        console.log(`   Email    : ${admin.email}`);
        console.log(`   Password : ${ADMIN_PASSWORD}`);
        console.log(`   Role     : ${admin.role}`);
        console.log('━'.repeat(40));
        console.log('\n⚠️  IMPORTANT: Change the default password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Admin Seeding Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();

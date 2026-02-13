/**
 * Seed script to create the initial admin user.
 * Run: npx tsx scripts/seed-admin.ts
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function seedAdmin() {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env.local');
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db!;
        const usersCollection = db.collection('users');

        // Check if admin already exists
        const existingAdmin = await usersCollection.findOne({ email: 'admin@office.com' });

        if (existingAdmin) {
            console.log('Admin user already exists. Skipping seed.');
            await mongoose.disconnect();
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await usersCollection.insertOne({
            name: 'Super Admin',
            email: 'admin@office.com',
            password: hashedPassword,
            role: 'admin',
            department: '',
            createdAt: new Date(),
        });

        console.log('\n✅ Admin user created successfully!');
        console.log('   Email:    admin@office.com');
        console.log('   Password: admin123');
        console.log('\n⚠️  Please change this password after first login.\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();

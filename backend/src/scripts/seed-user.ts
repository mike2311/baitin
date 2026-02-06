/**
 * Seed Default User Script
 *
 * Creates a default admin user for PoC testing.
 * Run with: ts-node src/scripts/seed-user.ts
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../../.env') });

async function seedUser() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'postgres',
    ssl: process.env.DATABASE_HOST?.includes('supabase.co')
      ? { rejectUnauthorized: false }
      : false,
    entities: [User],
    synchronize: false, // Don't sync, just connect
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');

    const userRepository = dataSource.getRepository(User);

    // Check if admin user already exists
    const existingUser = await userRepository.findOne({
      where: { username: 'admin' },
    });

    if (existingUser) {
      console.log('ℹ️  Admin user already exists');
      await dataSource.destroy();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = userRepository.create({
      username: 'admin',
      password: hashedPassword,
      userRight: 'SUPERVISOR',
      companyCode: 'HT',
      active: true,
    });

    await userRepository.save(adminUser);
    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: SUPERVISOR');
    console.log('   Company: HT');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding user:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seedUser();

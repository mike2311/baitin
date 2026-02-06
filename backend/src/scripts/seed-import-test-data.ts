/**
 * Seed Test Data for Excel Import Testing
 *
 * Creates the required test data:
 * - Customer: CUST001
 * - Items: ITEM001, ITEM002
 *
 * Run with: ts-node src/scripts/seed-import-test-data.ts
 */

import { DataSource } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Item } from '../items/entities/item.entity';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

async function seedTestData() {
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
    entities: [Customer, Item],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');

    const customerRepo = dataSource.getRepository(Customer);
    const itemRepo = dataSource.getRepository(Item);

    // Create Customer CUST001
    let customer = await customerRepo.findOne({ where: { custNo: 'CUST001' } });
    if (!customer) {
      customer = customerRepo.create({
        custNo: 'CUST001',
        ename: 'Test Customer 001',
        sname: 'TC001',
        creDate: new Date(),
        creUser: 'system',
        userId: 'system',
      });
      customer = await customerRepo.save(customer);
      console.log('✅ Created customer: CUST001');
    } else {
      console.log('ℹ️  Customer CUST001 already exists');
    }

    // Create Items ITEM001 and ITEM002
    const items = [
      { itemNo: 'ITEM001', ename: 'Test Item 001', sname: 'TI001' },
      { itemNo: 'ITEM002', ename: 'Test Item 002', sname: 'TI002' },
    ];

    for (const itemData of items) {
      let item = await itemRepo.findOne({ where: { itemNo: itemData.itemNo } });
      if (!item) {
        item = itemRepo.create({
          ...itemData,
          creDate: new Date(),
          creUser: 'system',
          userId: 'system',
        });
        item = await itemRepo.save(item);
        console.log(`✅ Created item: ${itemData.itemNo}`);
      } else {
        console.log(`ℹ️  Item ${itemData.itemNo} already exists`);
      }
    }

    console.log('\n✅ Test data seeding complete!');
    console.log('   Customer: CUST001');
    console.log('   Items: ITEM001, ITEM002');
    console.log('\nYou can now:');
    console.log('   1. Create OE Control with customer CUST001');
    console.log('   2. Import your CSV file');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seedTestData();

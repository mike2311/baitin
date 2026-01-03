import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Item } from '../../items/entities/item.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Zstdcode } from '../../reference/entities/zstdcode.entity';
import { Zorigin } from '../../reference/entities/zorigin.entity';

/**
 * Database Seed Script
 *
 * Seeds initial data for development and testing.
 *
 * Reference: Task 03-01, 03-02 - Database Schema
 */
export async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const itemRepository = dataSource.getRepository(Item);
  const customerRepository = dataSource.getRepository(Customer);
  const vendorRepository = dataSource.getRepository(Vendor);
  const zstdcodeRepository = dataSource.getRepository(Zstdcode);
  const zoriginRepository = dataSource.getRepository(Zorigin);

  // Seed Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = userRepository.create({
    username: 'admin',
    password: hashedPassword,
    userRight: 'SUPERVISOR',
    companyCode: 'HT',
    active: true,
  });

  const regularUser = userRepository.create({
    username: 'user1',
    password: hashedPassword,
    userRight: 'REGULAR_USER',
    companyCode: 'HT',
    active: true,
  });

  await userRepository.save([adminUser, regularUser]);
  console.log('✓ Users seeded');

  // Seed Reference Data
  const stdCodes = [
    { stdCode: 'STD001', description: 'Standard Code 001' },
    { stdCode: 'STD002', description: 'Standard Code 002' },
  ];

  const origins = [
    { origin: 'CN', description: 'China' },
    { origin: 'US', description: 'United States' },
    { origin: 'JP', description: 'Japan' },
  ];

  await zstdcodeRepository.save(
    stdCodes.map((sc) => zstdcodeRepository.create(sc)),
  );
  await zoriginRepository.save(origins.map((o) => zoriginRepository.create(o)));
  console.log('✓ Reference data seeded');

  // Seed Sample Items
  const items = [
    {
      itemNo: 'ITEM001',
      shortName: 'Sample Item 1',
      origin: 'CN',
      stdCode: 'STD001',
      price: 10.5,
      priceCur: 'USD',
    },
    {
      itemNo: 'ITEM002',
      shortName: 'Sample Item 2',
      origin: 'US',
      stdCode: 'STD002',
      price: 25.0,
      priceCur: 'USD',
    },
  ];

  await itemRepository.save(items.map((i) => itemRepository.create(i)));
  console.log('✓ Items seeded');

  // Seed Sample Customers
  const customers = [
    {
      custNo: 'CUST001',
      ename: 'Customer One',
      sname: 'Cust1',
      addr1: '123 Main St',
      tel: '123-456-7890',
    },
    {
      custNo: 'CUST002',
      ename: 'Customer Two',
      sname: 'Cust2',
      addr1: '456 Oak Ave',
      tel: '234-567-8901',
    },
  ];

  await customerRepository.save(
    customers.map((c) => customerRepository.create(c)),
  );
  console.log('✓ Customers seeded');

  // Seed Sample Vendors
  const vendors = [
    {
      vendorNo: 'VEND001',
      ename: 'Vendor One',
      sname: 'Vend1',
      type: 1, // Vendor
    },
    {
      vendorNo: 'VEND002',
      ename: 'Vendor Two',
      sname: 'Vend2',
      type: 2, // Maker
    },
  ];

  await vendorRepository.save(vendors.map((v) => vendorRepository.create(v)));
  console.log('✓ Vendors seeded');

  console.log('✓ Database seeding completed');
}

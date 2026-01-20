const { DataSource } = require('typeorm');

const testConnection = async () => {
  console.log('🔍 Testing database connection...\n');
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: 'postgres',
    database: 'baitin_test',
    synchronize: false,
    logging: true,
  });

  try {
    console.log('📡 Attempting to connect...');
    await dataSource.initialize();
    console.log('✅ Database connection successful!');
    
    const result = await dataSource.query('SELECT version()');
    console.log('📊 PostgreSQL version:', result[0].version);
    
    await dataSource.destroy();
    console.log('✅ Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
    process.exit(1);
  }
};

testConnection();

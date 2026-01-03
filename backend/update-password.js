const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function updatePassword() {
  // Generate hash
  const hash = await bcrypt.hash('password123', 10);
  console.log('Generated hash:', hash);
  
  // Test the hash
  const isValid = await bcrypt.compare('password123', hash);
  console.log('Hash validation test:', isValid);
  
  // Update database
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'baitin_dev',
    password: 'baitin_dev_123',
    database: 'baitin_poc_dev',
  });
  
  try {
    await client.connect();
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hash, 'admin']
    );
    console.log('Updated rows:', result.rowCount);
    
    // Verify
    const verify = await client.query(
      'SELECT username, active FROM users WHERE username = $1',
      ['admin']
    );
    console.log('User:', verify.rows[0]);
    
    // Test password comparison with stored hash
    const storedHash = await client.query(
      'SELECT password FROM users WHERE username = $1',
      ['admin']
    );
    const testMatch = await bcrypt.compare('password123', storedHash.rows[0].password);
    console.log('Final password match test:', testMatch);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

updatePassword();





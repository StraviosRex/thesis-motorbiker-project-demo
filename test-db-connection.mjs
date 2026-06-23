import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;

console.log('Testing database connection...');
console.log('DATABASE_URL exists:', !!DATABASE_URL);
console.log('DATABASE_URL starts with:', DATABASE_URL?.substring(0, 20) + '...');

try {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  console.log('✓ Connected successfully!');
  
  const result = await client.query('SELECT NOW()');
  console.log('✓ Query executed:', result.rows[0]);
  
  client.release();
  await pool.end();
  console.log('✓ Connection closed');
} catch (error) {
  console.error('✗ Connection failed:');
  console.error('  Error:', error.message);
  console.error('  Code:', error.code);
}

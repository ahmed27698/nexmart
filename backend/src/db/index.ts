import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing from backend/.env');
  process.exit(1);
}

console.log('🔌 Connecting to:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test connection immediately on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ DB connection failed:', err.message);
    console.error('   Code:', (err as any).code);
  } else {
    console.log('✅ Database connected successfully!');
    release();
  }
});

async function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<any[]> {
  let text = '';
  const params: unknown[] = [];
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      text += `$${params.length}`;
    }
  }
  const result = await pool.query(text, params);
  return result.rows;
}

export default sql;

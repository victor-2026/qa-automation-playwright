import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'buzzhive',
  user: 'buzzhive_user',
  password: 'buzzhive_password',
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function getOne(text: string, params?: any[]) {
  const result = await query(text, params);
  return result.rows[0];
}

export async function getAll(text: string, params?: any[]) {
  const result = await query(text, params);
  return result.rows;
}

export async function close() {
  await pool.end();
}

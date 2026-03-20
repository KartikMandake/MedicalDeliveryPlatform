import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'medical_delivery',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '4525',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    };

export const pool = new Pool(connectionConfig);

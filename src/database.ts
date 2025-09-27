import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  POSTGRES_TEST_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  ENV
} = process.env;

const database = ENV === 'test' ? POSTGRES_TEST_DB : POSTGRES_DB;

export const client = new Pool({
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  database,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD
});

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { client } from '../database';

const pepper = process.env.BCRYPT_PEPPER as string;
const saltRounds = Number(process.env.SALT_ROUNDS);

export type User = {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
};

export class UserModel {
  async index(): Promise<User[]> {
    const c = await client.connect();
    const r = await c.query('SELECT id, email, first_name, last_name FROM users ORDER BY id');
    c.release();
    return r.rows;
  }

  async show(id: number): Promise<User | null> {
    const c = await client.connect();
    const r = await c.query('SELECT id, email, first_name, last_name FROM users WHERE id=$1', [id]);
    c.release();
    return r.rows[0] || null;
  }

  async create(u: User): Promise<{ user: User; token: string }> {
    const c = await client.connect();
    const hash = bcrypt.hashSync((u.password as string) + pepper, saltRounds);
    const r = await c.query(
  'INSERT INTO users(email, first_name, last_name, password_digest) ' +
  'VALUES ($1,$2,$3,$4) RETURNING id, email, first_name, last_name',
  [u.email, u.first_name, u.last_name, hash]
);
    c.release();
    const user = r.rows[0];
const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string);
return { user, token };
  }

  async authenticate(email: string, password: string): Promise<string | null> {
    const c = await client.connect();
    const r = await c.query('SELECT * FROM users WHERE email=$1', [email]);
    c.release();
    const u = r.rows[0];
    if (!u) return null;
    const valid = bcrypt.compareSync(password + pepper, u.password_digest);
    if (!valid) return null;
    return jwt.sign({ id: u.id, email: u.email }, process.env.JWT_SECRET as string);
  }
}

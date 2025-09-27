import { Request, Response, Router } from 'express';
import { UserModel } from '../models/user';
import { verifyAuthToken } from '../middleware/auth';

export const usersRouter = Router();
const users = new UserModel();

usersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { email, first_name, last_name, password } = req.body;
    const out = await users.create({ email, first_name, last_name, password });
    res.status(201).json(out); // { user, token }
  } catch (err) {
    console.error('POST /users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

usersRouter.post('/auth', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const token = await users.authenticate(email, password);
    if (!token) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token });
  } catch (err) {
    console.error('POST /users/auth error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

usersRouter.get('/', verifyAuthToken, async (_req, res) => {
  try {
    res.json(await users.index());
  } catch (err) {
    console.error('GET /users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

usersRouter.get('/:id', verifyAuthToken, async (req, res) => {
  try {
    const u = await users.show(Number(req.params.id));
    if (!u) return res.sendStatus(404);
    res.json(u);
  } catch (err) {
    console.error('GET /users/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

import { Request, Response, Router } from 'express';
import { UserModel } from '../models/user';
import { verifyAuthToken } from '../middleware/auth';

export const usersRouter = Router();
const users = new UserModel();

usersRouter.post('/', async (req: Request, res: Response) => {
  const { email, first_name, last_name, password } = req.body;
  const out = await users.create({ email, first_name, last_name, password });
  res.status(201).json(out); // { user, token }
});

usersRouter.post('/auth', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const token = await users.authenticate(email, password);
  if (!token) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token });
});

usersRouter.get('/', verifyAuthToken, async (_req, res) => {
  res.json(await users.index());
});

usersRouter.get('/:id', verifyAuthToken, async (req, res) => {
  const u = await users.show(Number(req.params.id));
  if (!u) return res.sendStatus(404);
  res.json(u);
});

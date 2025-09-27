import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = (req.headers.authorization || '').split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

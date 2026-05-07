import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

type Role = 'CITIZEN' | 'STAFF' | 'SUPERVISOR' | 'ADMIN';

const users = new Map<string, { id: string; email: string; name: string; passwordHash: string; role: Role; orgId: string }>();

function sign(userId: string, orgId: string, role: Role) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign({ sub: userId, orgId, role }, secret, { expiresIn: '7d' });
}

export async function registerHandler(req: Request, res: Response) {
  const { email, password, name, role = 'CITIZEN', orgId = 'demo-org' } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  if (users.has(email)) return res.status(409).json({ error: 'User exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const id = `user_${users.size + 1}`;
  users.set(email, { id, email, name, passwordHash, role, orgId });
  const token = sign(id, orgId, role);
  res.status(201).json({ token, user: { id, email, name, role, orgId } });
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body || {};
  const user = users.get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = sign(user.id, user.orgId, user.role);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, orgId: user.orgId } });
}

export async function meHandler(req: Request, res: Response) {
  const authUser = (req as any).authUser as { id: string; orgId: string; role: Role } | undefined;
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ me: authUser });
}



import { Router } from 'express';
import { requireAuth } from '../auth/util';

type ReportStatus = 'NEW' | 'TRIAGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED' | 'CLOSED';

export type Report = {
  id: string;
  orgId: string;
  reporterId?: string;
  title: string;
  description?: string;
  category: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status: ReportStatus;
  location?: { lat: number; lng: number; address?: string };
  media: string[];
  createdAt: string;
  updatedAt: string;
};

const reports: Report[] = [];

const router = Router();

router.post('/', requireAuth, (req, res) => {
  const auth = (req as any).authUser as { id: string; orgId: string };
  const { title, description, category, priority, location } = req.body || {};
  if (!title || !category) return res.status(400).json({ error: 'Missing fields' });
  const now = new Date().toISOString();
  const report: Report = {
    id: `rep_${reports.length + 1}`,
    orgId: auth.orgId,
    reporterId: auth.id,
    title,
    description,
    category,
    priority,
    status: 'NEW',
    location,
    media: [],
    createdAt: now,
    updatedAt: now,
  };
  reports.push(report);
  res.status(201).json({ report });
});

router.get('/', requireAuth, (req, res) => {
  const auth = (req as any).authUser as { orgId: string };
  const { status, category } = req.query as Record<string, string>;
  let data = reports.filter(r => r.orgId === auth.orgId);
  if (status) data = data.filter(r => r.status === status);
  if (category) data = data.filter(r => r.category === category);
  res.json({ reports: data });
});

router.get('/:id', requireAuth, (req, res) => {
  const auth = (req as any).authUser as { orgId: string };
  const rep = reports.find(r => r.id === req.params.id && r.orgId === auth.orgId);
  if (!rep) return res.status(404).json({ error: 'Not found' });
  res.json({ report: rep });
});

router.patch('/:id', requireAuth, (req, res) => {
  const auth = (req as any).authUser as { orgId: string };
  const rep = reports.find(r => r.id === req.params.id && r.orgId === auth.orgId);
  if (!rep) return res.status(404).json({ error: 'Not found' });
  const { status, title, description, priority } = req.body || {};
  if (status) rep.status = status;
  if (title) rep.title = title;
  if (description) rep.description = description;
  if (priority) rep.priority = priority;
  rep.updatedAt = new Date().toISOString();
  res.json({ report: rep });
});

// Placeholder for media upload endpoint; in MVP this would use signed URLs
router.post('/:id/media', requireAuth, (req, res) => {
  const auth = (req as any).authUser as { orgId: string };
  const rep = reports.find(r => r.id === req.params.id && r.orgId === auth.orgId);
  if (!rep) return res.status(404).json({ error: 'Not found' });
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'Missing url' });
  rep.media.push(url);
  rep.updatedAt = new Date().toISOString();
  res.json({ report: rep });
});

export default router;



import { Router } from 'express';
import { loginHandler, registerHandler, meHandler } from './service';
import { requireAuth } from './util';

const router = Router();
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', requireAuth, meHandler);
export default router;



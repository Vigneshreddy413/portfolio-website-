import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './modules/auth/routes';
import reportsRouter from './modules/reports/routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/reports', reportsRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on ${port}`);
});



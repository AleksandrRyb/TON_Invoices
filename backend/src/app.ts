import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import pino from 'pino-http';
import userRoutes from './api/routes/userRoutes';
import invoiceRoutes from './api/routes/invoiceRoutes';
import authRoutes from './api/routes/authRoutes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
    },
  },
}));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Whales Corp!');
});

app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/auth', authRoutes);

export default app; 
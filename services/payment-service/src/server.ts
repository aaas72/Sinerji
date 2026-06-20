import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payment.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Sinerji Payment Microservice' });
});

app.listen(PORT, () => {
  console.log(`[Sinerji-Payment] Service is running on http://localhost:${PORT}`);
});
// Trigger reload after env update: 2026-06-20T10:23:00


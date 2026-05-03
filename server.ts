import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import Paystack from 'paystack';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Paystack (Lazy)
  let paystackClient: any = null;
  const getPaystack = () => {
    if (!paystackClient) {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (!secret) throw new Error('PAYSTACK_SECRET_KEY is missing');
      paystackClient = Paystack(secret);
    }
    return paystackClient;
  };

  // Paystack: Initialize Transaction (for Subscriptions/Deposits)
  app.post('/api/paystack/initialize', async (req, res) => {
    try {
      const { email, amount, metadata } = req.body;
      const paystack = getPaystack();
      
      const response = await new Promise((resolve, reject) => {
        paystack.transaction.initialize({
          email,
          amount: amount * 100, // Paystack expects kobo/cents
          metadata,
          callback_url: `${req.protocol}://${req.get('host')}/api/paystack/verify`
        }, (error: any, body: any) => {
          if (error) reject(error);
          else resolve(body);
        });
      });

      res.json(response);
    } catch (error: any) {
      console.error('Paystack Init Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Paystack: Verify Transaction
  app.get('/api/paystack/verify', async (req, res) => {
    try {
      const { trxref } = req.query;
      const paystack = getPaystack();

      const response = await new Promise((resolve, reject) => {
        paystack.transaction.verify(trxref, (error: any, body: any) => {
          if (error) reject(error);
          else resolve(body);
        });
      });

      // Here you would typically update Supabase DB with the success status
      // For now, redirect back to the app with the status
      res.redirect(`/?payment_status=success&reference=${trxref}`);
    } catch (error: any) {
      console.error('Paystack Verify Error:', error);
      res.redirect(`/?payment_status=failed`);
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Thalexa backend running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

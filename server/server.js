import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngestClient, functions } from './inngest/index.js';

const app = express();
const port = process.env.PORT || 3000;

// ✅ Connect to MongoDB (ONLY ONCE)
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => {
  res.send('Server is running');
});
app.use('/api/inngest', serve({ client: inngestClient, functions }));

// Start server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
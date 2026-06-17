import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngestClient, functions } from './inngest/index.js';
import rateLimit from 'express-rate-limit';

// Routes Imports
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import theaterRoutes from './routes/theaterRoutes.js';
import showRoutes from './routes/showRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { serveSwagger } from './configs/swagger.js';

const app = express();
const port = process.env.PORT || 3000;
const uploadsDir = join(process.cwd(), 'uploads', 'shows');

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Connect to MongoDB (ONLY ONCE)
await connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Swagger API Documentation
serveSwagger(app);

// Inngest Event serving
app.use('/api/inngest', serve({ client: inngestClient, functions }));

// Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes); // Profile & favourites endpoints can be mapped under users as well
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Server is running. Documentation is available at <a href="/api-docs">/api-docs</a>');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
  console.log(`Swagger documentation is available at http://localhost:${port}/api-docs`);
});
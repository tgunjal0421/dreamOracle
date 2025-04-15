import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Clerk } from '@clerk/clerk-sdk-node';
import { connectDB } from './config/database.js';
import { interpretRoutes } from './routes/interpret.js';
import { dreamRoutes } from './routes/dreamRoutes.js';

// Initialize express app
const app = express();
const port = process.env.PORT || 5002;

// Initialize Clerk
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/interpret', interpretRoutes);
app.use('/api/dream', dreamRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.statusCode === 401) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

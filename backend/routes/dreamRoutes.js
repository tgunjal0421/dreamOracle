import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { interpretDreamHandler, getDreamHistory, deleteDream } from '../controllers/dreamController.js';

const router = express.Router();

// Protect all routes with Clerk authentication
// Clerk authentication middleware
router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  // Add the token to the request for Clerk middleware
  req.headers['authorization'] = `Bearer ${token}`;
  next();
});

router.use(ClerkExpressRequireAuth());

// Dream interpretation routes
router.post('/interpret', interpretDreamHandler);
router.get('/history', getDreamHistory);
router.delete('/:id', deleteDream);

export const dreamRoutes = router;
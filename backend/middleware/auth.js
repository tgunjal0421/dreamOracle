// auth.js
import { requireAuth as clerkRequireAuth } from '@clerk/express';
import User from '../models/User.js';

const requireAuth = clerkRequireAuth(); // Clerk middleware that verifies JWT session

// Middleware to sync Clerk user with MongoDB and attach to request
const attachUser = async (req, res, next) => {
  try {
    const { userId, sessionClaims } = req.auth;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user exists in DB
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // Fallbacks if sessionClaims are not present
      const email = sessionClaims?.email || 'unknown@unknown.com';
      const firstName = sessionClaims?.firstName || 'User';
      const lastName = sessionClaims?.lastName || '';

      user = await User.create({
        clerkId: userId,
        email,
        firstName,
        lastName,
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Attach user to request for access in routes
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { requireAuth, attachUser };

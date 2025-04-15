import { Clerk } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Middleware to attach user to request
const attachUser = async (req, res, next) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find or create user in our database
    let user = await User.findOne({ clerkId: req.auth.userId });
    
    if (!user) {
      // Get user details from Clerk
      const clerkUser = req.auth;
      
      // Create new user in our database
      user = await User.create({
        clerkId: clerkUser.userId,
        email: clerkUser.email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const requireAuth = async (req, res, next) => {
  try {
    // Get the session token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify the session token with Clerk
    const session = await clerk.sessions.verifySession(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Get or create user in our database
    let user = await User.findOne({ clerkId: session.userId });
    
    if (!user) {
      // Get user details from Clerk
      const clerkUser = await clerk.users.getUser(session.userId);
      
      // Create new user in our database
      user = await User.create({
        clerkId: session.userId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
      });
    }

    // Attach user to request object
    req.auth = session;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  requireAuth,
  attachUser
};

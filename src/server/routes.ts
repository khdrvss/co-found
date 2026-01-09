import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query } from './db';
import {
  signUpSchema,
  loginSchema,
  createProjectSchema,
  validateInput,
} from './validation';
import {
  asyncHandler,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  logError,
  retryOperation,
} from './errors';
import {
  authLimiter,
  signupLimiter,
  mutationLimiter,
  readLimiter,
} from './rate-limit';
import {
  sanitizeInput,
  sanitizeRequestBody,
  sanitizeArray,
  sanitizers,
} from './sanitize';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Apply sanitization middleware to all routes
router.use(sanitizeRequestBody);

// Request logger
router.use((req, _res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Apply sanitization middleware first
router.use(sanitizeRequestBody);

// JWT auth middleware with improved error handling
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'No authentication token provided',
      statusCode: 401,
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      logError(err, 'JWT verification failed');
      return res.status(403).json({
        error: 'Invalid or expired token',
        statusCode: 403,
      });
    }
    req.user = user;
    next();
  });
};

// Auth: Sign Up with validation and rate limiting
router.post('/auth/signup', signupLimiter, asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = validateInput(signUpSchema, req.body);

    // Check if email already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [validatedData.email]
    );

    if (existingUser.rows.length > 0) {
      throw new ValidationError('Email already registered', 'This email is already in use');
    }

    // Hash password with retry logic
    const passwordHash = await retryOperation(
      () => bcrypt.hash(validatedData.password, 10),
      2
    );

    // Create user
    const userResult = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [validatedData.email, passwordHash]
    );
    const user = userResult.rows[0];

    // Create profile
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(validatedData.email)}`;
    await query(
      'INSERT INTO profiles (user_id, full_name, avatar_url) VALUES ($1, $2, $3)',
      [user.id, validatedData.fullName || validatedData.email.split('@')[0], avatarUrl]
    );

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    } as SignOptions);

    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Signup');
    throw new DatabaseError('Failed to create user account', error instanceof Error ? error.message : undefined);
  }
}));

// Auth: Login with validation and rate limiting
router.post('/auth/login', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = validateInput(loginSchema, req.body);

    // Find user
    const result = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [validatedData.email]
    );
    const user = result.rows[0];

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(
      validatedData.password,
      user.password_hash
    );

    if (!passwordMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Get profile
    const profileRes = await query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [user.id]
    );

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    } as SignOptions);

    res.json({ user, profile: profileRes.rows[0], token });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Login');
    throw new DatabaseError('Login failed', error instanceof Error ? error.message : undefined);
  }
}));

// Auth: Get current user
router.get('/auth/me', authenticateToken, asyncHandler(async (req: any, res: Response) => {
  try {
    const userRes = await query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userRes.rows.length === 0) {
      throw new NotFoundError('User');
    }

    const profileRes = await query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [req.user.userId]
    );

    res.json({ user: userRes.rows[0], profile: profileRes.rows[0] });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Get current user');
    throw new DatabaseError('Failed to retrieve user profile');
  }
}));

// Get all people with pagination
router.get('/people', asyncHandler(async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT p.*, u.email
       FROM profiles p
       LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as count FROM profiles');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), 'Get people');
    throw new DatabaseError('Failed to retrieve people list');
  }
}));

// Get all projects with pagination
router.get('/projects', asyncHandler(async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT * FROM projects ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as count FROM projects');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), 'Get projects');
    throw new DatabaseError('Failed to retrieve projects list');
  }
}));

// Create project with validation
router.post('/projects', authenticateToken, asyncHandler(async (req: any, res: Response) => {
  try {
    // Validate input
    const validatedData = validateInput(createProjectSchema, req.body);

    const result = await query(
      `INSERT INTO projects (user_id, name, description, category, stage, viloyat, work_type, looking_for)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user.userId,
        validatedData.name,
        validatedData.description,
        validatedData.category,
        validatedData.stage,
        validatedData.viloyat,
        validatedData.workType || 'office',
        validatedData.lookingFor || [],
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Create project');
    throw new DatabaseError('Failed to create project', error instanceof Error ? error.message : undefined);
  }
}));

// Get private messages with pagination
router.get('/messages/private/:partnerId', authenticateToken, asyncHandler(async (req: any, res: Response) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user.userId;

    // Validate partner ID format
    if (!partnerId || partnerId.length === 0) {
      throw new ValidationError('Invalid partner ID');
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, sender_id, receiver_id, message, created_at
       FROM private_messages
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [userId, partnerId, limit, offset]
    );

    res.json({ messages: result.rows.reverse() });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Get private messages');
    throw new DatabaseError('Failed to retrieve messages');
  }
}));

// Send private message with validation
router.post('/messages/private', authenticateToken, asyncHandler(async (req: any, res: Response) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || receiverId.trim().length === 0) {
      throw new ValidationError('Recipient ID is required');
    }

    if (!message || message.trim().length === 0) {
      throw new ValidationError('Message cannot be empty');
    }

    if (message.length > 5000) {
      throw new ValidationError('Message is too long (maximum 5000 characters)');
    }

    if (senderId === receiverId) {
      throw new ValidationError('Cannot send message to yourself');
    }

    const result = await query(
      `INSERT INTO private_messages (sender_id, receiver_id, message)
       VALUES ($1, $2, $3) RETURNING *`,
      [senderId, receiverId, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Send private message');
    throw new DatabaseError('Failed to send message', error instanceof Error ? error.message : undefined);
  }
}));

export default router;

import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { query } from './db';
import { getJwtSecret } from './config';
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
import logger from './logger';
import { emitToUser } from './socket';
import { messageRateLimiter } from './message-rate-limiter';
import { messagesSent, messagesRead } from './metrics';

const router = express.Router();
const JWT_SECRET = getJwtSecret();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Apply sanitization middleware to all routes
router.use(sanitizeRequestBody);

// Request logger
router.use((req, _res, next) => {
  logger.debug(`API ${req.method} ${req.path}`, { body: req.body });
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

// Auth: Google Sign-In
router.post('/auth/google', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      throw new ValidationError('Google credential is required');
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AuthenticationError('Invalid Google token');
    }

    const { email, name, picture } = payload;

    // Check if user exists
    let userResult = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    let user = userResult.rows[0];
    let profile;

    if (!user) {
      // Create new user
      userResult = await query(
        'INSERT INTO users (email, password_hash, google_id) VALUES ($1, $2, $3) RETURNING id, email, created_at',
        [email, '', payload.sub] // Empty password for Google users
      );
      user = userResult.rows[0];

      // Create profile
      const profileResult = await query(
        'INSERT INTO profiles (user_id, full_name, avatar_url) VALUES ($1, $2, $3) RETURNING *',
        [user.id, name || email.split('@')[0], picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`]
      );
      profile = profileResult.rows[0];
    } else {
      // Update google_id if not set
      if (!user.google_id) {
        await query(
          'UPDATE users SET google_id = $1 WHERE id = $2',
          [payload.sub, user.id]
        );
      }

      // Get profile
      const profileResult = await query(
        'SELECT * FROM profiles WHERE user_id = $1',
        [user.id]
      );
      profile = profileResult.rows[0];

      // Update avatar if from Google and not already set
      if (picture && (!profile.avatar_url || profile.avatar_url.includes('dicebear'))) {
        await query(
          'UPDATE profiles SET avatar_url = $1 WHERE user_id = $2',
          [picture, user.id]
        );
        profile.avatar_url = picture;
      }
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    } as SignOptions);

    // Return clean user object (without password_hash)
    const { password_hash, google_id, ...cleanUser } = user;
    res.json({ user: cleanUser, profile, token });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof AuthenticationError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Google Sign-In');
    throw new DatabaseError('Google sign-in failed', error instanceof Error ? error.message : undefined);
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

// Update profile
router.put('/auth/profile', authenticateToken, asyncHandler(async (req: any, res: Response) => {
    try {
        const { fullName, bio, viloyat, roles, skills, telegram_url, instagram_url, linkedin_url, avatar_url } = req.body;
        
        // Ensure user has a profile
        let profileRes = await query('SELECT * FROM profiles WHERE user_id = $1', [req.user.userId]);

        if (profileRes.rows.length === 0) {
            // Should not happen for authenticated users usually, but let's be safe
            await query(
                'INSERT INTO profiles (user_id, full_name, email) VALUES ($1, $2, $3)',
                [req.user.userId, fullName || '', req.user.email]
            );
        }

        // We need to handle 'roles' as an array for the DB if the schema supports it.
        // Based on previous context, 'role' column might be a string in DB but 'roles' is array in frontend.
        // Let's assume schema has 'role' as string (primary role) and maybe we join roles or just take the first one.
        // Or if we migrated schema to have 'roles' array. 
        // Checking schema.sql would be ideal but from mockPeople we see 'roles'. 
        // Let's safe bet: save primary role as string in 'role' column if 'role' column exists.
        // If we want to support multiple roles, we should check if 'roles' column exists.
        
        // Let's update standard fields first.
        const primaryRole = Array.isArray(roles) && roles.length > 0 ? roles[0] : (typeof roles === 'string' ? roles : '');

        const result = await query(
            `UPDATE profiles 
             SET full_name = $1, bio = $2, viloyat = $3, role = $4, skills = $5, telegram_url = $6, instagram_url = $7, linkedin_url = $8, avatar_url = $9
             WHERE user_id = $10
             RETURNING *`,
            [fullName, bio, viloyat, primaryRole, skills || [], telegram_url, instagram_url, linkedin_url, avatar_url, req.user.userId]
        );

        res.json(result.rows[0]);

    } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), 'Update profile');
        throw new DatabaseError("Profilni yangilashda xatolik");
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

// Update project by ID
router.put('/projects/:id', authenticateToken, asyncHandler(async (req: any, res: Response) => {
  try {
    const { name, description, category, stage, lookingFor, viloyat, workType, telegramLink, phone } = req.body;

    // Check if project exists and belongs to user
    const checkRes = await query(
      'SELECT * FROM projects WHERE id = $1',
      [req.params.id]
    );

    if (checkRes.rows.length === 0) {
      throw new NotFoundError('Project');
    }

    if (checkRes.rows[0].user_id !== req.user.userId) {
      throw new AuthorizationError('You can only edit your own projects');
    }

    const result = await query(
      `UPDATE projects 
       SET name = $1, description = $2, category = $3, stage = $4, looking_for = $5, viloyat = $6, work_type = $7, telegram_link = $8, phone = $9
       WHERE id = $10 
       RETURNING *`,
      [name, description, category, stage, lookingFor || [], viloyat, workType, telegramLink, phone, req.params.id]
    );

    // Fetch user data for response to match typical project structure
    const userRes = await query(
      'SELECT u.id, u.email, p.full_name, p.avatar_url FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = $1',
      [req.user.userId]
    );
    
    const project = {
      ...result.rows[0],
      lookingFor: result.rows[0].looking_for,
      workType: result.rows[0].work_type,
      telegramLink: result.rows[0].telegram_link,
      createdAt: result.rows[0].created_at,
      userId: result.rows[0].user_id,
      user: userRes.rows[0] ? {
          id: userRes.rows[0].id,
          email: userRes.rows[0].email,
          profile: {
              full_name: userRes.rows[0].full_name,
              avatar_url: userRes.rows[0].avatar_url
          }
      } : undefined
    };

    res.json(project);
  } catch (error) {
     if (error instanceof NotFoundError || error instanceof AuthorizationError) {
       throw error;
     }
     logError(error instanceof Error ? error : new Error(String(error)), `Update project ${req.params.id}`);
     throw new DatabaseError("Failed to update project");
  }
}));

// Route for deleting a project
router.delete('/projects/:id', authenticateToken, asyncHandler(async (req: any, res: Response) => {
  try {
    // Check if project exists and belongs to user
    const checkRes = await query(
      'SELECT * FROM projects WHERE id = $1',
      [req.params.id]
    );

    if (checkRes.rows.length === 0) {
      throw new NotFoundError('Project');
    }

    if (checkRes.rows[0].user_id !== req.user.userId) {
      throw new AuthorizationError('You can only delete your own projects');
    }

    // Delete project
    await query(
      'DELETE FROM projects WHERE id = $1',
      [req.params.id]
    );

    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AuthorizationError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), `Delete project ${req.params.id}`);
    throw new DatabaseError('Failed to delete project');
  }
}));

// Join project (create join request)
router.post('/projects/:id/join', authenticateToken, mutationLimiter, asyncHandler(async (req: any, res: Response) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;
    const { message } = req.body;

    // Check if project exists
    const projectRes = await query(
      'SELECT user_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectRes.rows.length === 0) {
      throw new NotFoundError('Project not found');
    }

    // Check if user is trying to join their own project
    if (projectRes.rows[0].user_id === userId) {
      throw new ValidationError('You cannot join your own project');
    }

    // Check if join request already exists
    const existingRequest = await query(
      'SELECT id, status FROM join_requests WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (existingRequest.rows.length > 0) {
      const status = existingRequest.rows[0].status;
      if (status === 'pending') {
        throw new ValidationError('You have already sent a join request for this project');
      } else if (status === 'accepted') {
        throw new ValidationError('You are already a member of this project');
      }
      // If rejected, allow them to request again by updating the existing record
      await query(
        'UPDATE join_requests SET status = $1, message = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        ['pending', message || null, existingRequest.rows[0].id]
      );
      res.status(201).json({ message: 'Join request re-submitted successfully' });
      return;
    }

    // Create new join request
    const result = await query(
      'INSERT INTO join_requests (project_id, user_id, status, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [projectId, userId, 'pending', message || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), `Join project ${req.params.id}`);
    throw new DatabaseError('Failed to create join request');
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
      `SELECT pm.id, pm.sender_id, pm.receiver_id, pm.message, pm.created_at, pm.read,
              COALESCE(p.full_name, u.email) as sender_name,
              p.avatar_url as sender_avatar
       FROM private_messages pm
       JOIN users u ON u.id = pm.sender_id
       LEFT JOIN profiles p ON p.user_id = pm.sender_id
       WHERE (pm.sender_id = $1 AND pm.receiver_id = $2) OR (pm.sender_id = $2 AND pm.receiver_id = $1)
       ORDER BY pm.created_at ASC
       LIMIT $3 OFFSET $4`,
      [userId, partnerId, limit, offset]
    );

    // Return array directly for simplicity
    res.json(result.rows);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Get private messages');
    throw new DatabaseError('Failed to retrieve messages');
  }
}));

// Send private message with validation
router.post('/messages/private', authenticateToken, messageRateLimiter, asyncHandler(async (req: any, res: Response) => {
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

    const insert = await query(
      `INSERT INTO private_messages (sender_id, receiver_id, message)
       VALUES ($1, $2, $3) RETURNING *`,
      [senderId, receiverId, message]
    );

    const newMsg = insert.rows[0];

    // Fetch sender profile info to enrich response
    const senderRes = await query(
      'SELECT COALESCE(p.full_name, u.email) as sender_name, p.avatar_url as sender_avatar FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = $1',
      [senderId]
    );

    const enriched = {
      id: newMsg.id,
      sender_id: newMsg.sender_id,
      receiver_id: newMsg.receiver_id,
      message: newMsg.message,
      created_at: newMsg.created_at,
      sender_name: senderRes.rows[0]?.sender_name,
      sender_avatar: senderRes.rows[0]?.sender_avatar,
    };

    // Compute unread counts for both parties to provide a better real-time payload
    try {
      const unreadForReceiverRes = await query(
        'SELECT COUNT(*) as count FROM private_messages WHERE sender_id = $1 AND receiver_id = $2 AND read = false',
        [senderId, receiverId]
      );
      const unreadForReceiver = parseInt(unreadForReceiverRes.rows[0]?.count || '0', 10) || 0;

      const unreadForSenderRes = await query(
        'SELECT COUNT(*) as count FROM private_messages WHERE sender_id = $1 AND receiver_id = $2 AND read = false',
        [receiverId, senderId]
      );
      const unreadForSender = parseInt(unreadForSenderRes.rows[0]?.count || '0', 10) || 0;

      // Emit real-time events to both the receiver and sender
      emitToUser(receiverId, 'message.created', { ...enriched, unread_count: unreadForReceiver });
      emitToUser(senderId, 'message.created', { ...enriched, unread_count: unreadForSender });

      // Metrics
      try {
        messagesSent.inc();
      } catch (e) {}
    } catch (err) {
      logger.warn('Failed to emit socket message events', { err });
    }

    res.status(201).json(enriched);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Send private message');
    throw new DatabaseError('Failed to send message', error instanceof Error ? error.message : undefined);
  }
}));

// Get project messages
router.get('/projects/:projectId/messages', authenticateToken, asyncHandler(async (req: any, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Validate project ID format
    if (!projectId || projectId.length === 0) {
      throw new ValidationError('Invalid project ID');
    }

    // Check if user is a member or owner of the project
    const projectCheck = await query(
      `SELECT user_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      throw new NotFoundError('Project not found');
    }

    // For now, allow any authenticated user to view messages
    // In production, you'd want to check project membership
    const result = await query(
      `SELECT 
        pm.id, 
        pm.user_id, 
        pm.message, 
        pm.created_at,
        COALESCE(p.full_name, u.email) as full_name,
        p.avatar_url
       FROM project_messages pm
       JOIN users u ON pm.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.created_at ASC
       LIMIT 100`,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Get project messages');
    throw new DatabaseError('Failed to retrieve messages');
  }
}));

// Send project message
router.post('/projects/:projectId/messages', authenticateToken, asyncHandler(async (req: any, res: Response) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || message.trim().length === 0) {
      throw new ValidationError('Message cannot be empty');
    }

    if (message.length > 5000) {
      throw new ValidationError('Message is too long (maximum 5000 characters)');
    }

    // Check if project exists
    const projectCheck = await query(
      `SELECT user_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      throw new NotFoundError('Project not found');
    }

    const result = await query(
      `INSERT INTO project_messages (project_id, user_id, message)
       VALUES ($1, $2, $3) RETURNING *`,
      [projectId, userId, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    logError(error instanceof Error ? error : new Error(String(error)), 'Send project message');
    throw new DatabaseError('Failed to send message', error instanceof Error ? error.message : undefined);
  }
}));

// Get conversation list for current user (include unread_count)
router.get('/messages/conversations', authenticateToken, asyncHandler(async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `WITH partners AS (
         SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS partner_id,
                MAX(created_at) AS last_message_at
         FROM private_messages
         WHERE sender_id = $1 OR receiver_id = $1
         GROUP BY partner_id
       )
       SELECT
         p.partner_id as id,
         pm.message as last_message,
         pm.created_at as last_message_at,
         pm.sender_id as last_sender_id,
         u.email,
         prof.full_name,
         prof.avatar_url,
         (SELECT COUNT(*) FROM private_messages pm2 WHERE pm2.sender_id = p.partner_id AND pm2.receiver_id = $1 AND pm2.read = false) as unread_count
       FROM partners p
       JOIN LATERAL (
         SELECT message, created_at, sender_id
         FROM private_messages pm
         WHERE (pm.sender_id = $1 AND pm.receiver_id = p.partner_id) OR (pm.receiver_id = $1 AND pm.sender_id = p.partner_id)
         ORDER BY pm.created_at DESC LIMIT 1
       ) pm ON true
       JOIN users u ON u.id = p.partner_id
       LEFT JOIN profiles prof ON prof.user_id = p.partner_id
       ORDER BY p.last_message_at DESC`,
      [userId]
    );

    const mapped = result.rows.map((r: any) => ({
      id: r.id,
      email: r.email,
      full_name: r.full_name,
      avatar_url: r.avatar_url,
      last_message: r.last_message,
      last_message_at: r.last_message_at,
      last_sender_id: r.last_sender_id,
      unread_count: parseInt(r.unread_count, 10) || 0,
    }));

    res.json(mapped);
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), 'Get conversations');
    throw new DatabaseError('Failed to retrieve conversations');
  }
}));

// Mark private messages as read
router.put('/messages/private/:partnerId/read', authenticateToken, asyncHandler(async (req: any, res: Response) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user.userId;

    if (!partnerId || partnerId.length === 0) {
      throw new ValidationError('Invalid partner ID');
    }

    const readUpTo = new Date().toISOString();

    const result = await query(
      `UPDATE private_messages SET read = true, read_at = $1 WHERE sender_id = $2 AND receiver_id = $3 AND (read = false OR read_at IS NULL) RETURNING id`,
      [readUpTo, partnerId, userId]
    );

    // Notify the partner that their messages were read so they can update unread counts and per-message state in real-time
    try {
      emitToUser(partnerId, 'messages.read', { by: userId, updated: result.rows.length, read_up_to: readUpTo });
    } catch (err) {
      logger.warn('Failed to emit messages.read event', { err });
    }

    try {
      messagesRead.inc(result.rows.length || 0);
    } catch (e) {}

    res.json({ updated: result.rows.length, read_up_to: readUpTo });
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), 'Mark messages read');
    throw new DatabaseError('Failed to mark messages as read');
  }
}));

export default router;

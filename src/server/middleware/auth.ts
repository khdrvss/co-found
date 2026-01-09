
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};

export const requireAdmin = async (req: any, res: any, next: any) => {
    // Must be authenticated first
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // const result = await query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
        // if (result.rows.length === 0 || !result.rows[0].is_admin) {
        //     return res.status(403).json({ error: 'Forbidden: Admin access only' });
        // }
        // Admin feature temporarily disabled as column was removed
        return res.status(403).json({ error: 'Forbidden: Admin access not available' });
        // next(); 
    } catch (error) {
        return res.status(500).json({ error: 'Server error checking admin status' });
    }
};

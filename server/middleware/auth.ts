import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'govproof-secret';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied: Authentication token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(401).json({ error: 'Invalid or expired authentication session' });
        req.user = user as AuthRequest['user'];
        next();
    });
};

export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        // Normalize role aliases if needed (e.g. 'Government' <-> 'Government Officer')
        const userRole = req.user.role;
        const normalizedUserRoles = [
            userRole,
            userRole === 'Government Officer' ? 'Government' : '',
            userRole === 'Government' ? 'Government Officer' : '',
            userRole === 'Startup Founder' ? 'Startup' : '',
            userRole === 'Startup' ? 'Startup Founder' : ''
        ].filter(Boolean);

        const hasPermission = roles.some(r => normalizedUserRoles.includes(r));
        if (!hasPermission) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions for this action' });
        }
        next();
    };
};

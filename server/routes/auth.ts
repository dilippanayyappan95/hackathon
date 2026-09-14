import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'govproof-secret';

// Login with email and password
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true, department: true, startup: true }
        });
        if (!user) return res.status(401).json({ error: 'Invalid enterprise credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid enterprise credentials' });

        const token = jwt.sign(
            { userId: user.id, role: user.role.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'USER_LOGIN',
                entity: 'User',
                entityId: user.id,
                details: JSON.stringify({ email: user.email, role: user.role.name })
            }
        });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name,
                departmentId: user.departmentId,
                department: user.department?.name,
                startupId: user.startupId,
                startup: user.startup?.name
            }
        });
    } catch (e) {
        console.error('[Auth Error]:', e);
        res.status(500).json({ error: 'Authentication server error' });
    }
});

// Verify current session
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId },
            include: { role: true, department: true, startup: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name,
                departmentId: user.departmentId,
                department: user.department?.name,
                startupId: user.startupId,
                startup: user.startup?.name
            }
        });
    } catch (e) {
        console.error('[Auth Me Error]:', e);
        res.status(500).json({ error: 'Failed to verify session' });
    }
});

// Quick demo role switcher (facilitates presentation testing)
router.post('/demo-switch', async (req, res) => {
    const { roleName, email } = req.body;
    try {
        let user;
        if (email) {
            user = await prisma.user.findUnique({
                where: { email },
                include: { role: true, department: true, startup: true }
            });
        } else if (roleName) {
            user = await prisma.user.findFirst({
                where: { role: { name: roleName } },
                include: { role: true, department: true, startup: true }
            });
        } else {
            user = await prisma.user.findFirst({
                include: { role: true, department: true, startup: true }
            });
        }

        if (!user) {
            return res.status(404).json({ error: 'Demo user not found for requested role' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name,
                departmentId: user.departmentId,
                department: user.department?.name,
                startupId: user.startupId,
                startup: user.startup?.name
            }
        });
    } catch (e) {
        console.error('[Demo Switch Error]:', e);
        res.status(500).json({ error: 'Failed to switch demo role' });
    }
});

export default router;

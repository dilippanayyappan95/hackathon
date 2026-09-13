import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'govproof-secret';

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try {
        const user = await prisma.user.findUnique({ where: { email }, include: { role: true, department: true, startup: true } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: '1d' });

        await prisma.auditLog.create({
            data: { userId: user.id, action: 'LOGIN', entity: 'User' }
        });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name,
                department: user.department?.name,
                startup: user.startup?.name
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import challengesRouter from './routes/challenges';
import pilotsRouter from './routes/pilots';
import startupsRouter from './routes/startups';
import analyticsRouter from './routes/analytics';
import applicationsRouter from './routes/applications';
import evaluationsRouter from './routes/evaluations';
import scaleRouter from './routes/scale';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/pilots', pilotsRouter);
app.use('/api/startups', startupsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/evaluations', evaluationsRouter);
app.use('/api/scale', scaleRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'active', platform: 'GovProof Core API' });
});

app.listen(PORT, () => {
    console.log(`[GovProof API] Server running on port ${PORT}`);
});

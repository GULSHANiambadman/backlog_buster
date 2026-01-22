import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import recommendationEngine from '../services/recommendationEngine.js';

const router = express.Router();

// Get game recommendations for the user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const recommendations = await recommendationEngine.getRecommendations(req.userId);

        res.json({
            recommendations,
            count: recommendations.length
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
    }
});

// Get library statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const stats = await recommendationEngine.getLibraryStats(req.userId);

        res.json({ stats });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Failed to get statistics', error: error.message });
    }
});

export default router;

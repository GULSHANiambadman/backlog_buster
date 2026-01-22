import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Game from '../models/Game.js';
import localScanService from '../services/localScanService.js';

const router = express.Router();

// Get all games for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { source, sort = 'title' } = req.query;

        const filter = { userId: req.userId };
        if (source) {
            filter.source = source;
        }

        const sortOptions = {
            title: { title: 1 },
            playtime: { playTime: -1 },
            recent: { createdAt: -1 }
        };

        const games = await Game.find(filter).sort(sortOptions[sort] || sortOptions.title);

        res.json({ games, count: games.length });
    } catch (error) {
        console.error('Get games error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Scan local disk for games
router.post('/scan-local', authMiddleware, async (req, res) => {
    try {
        const localGames = await localScanService.scanForGames();

        let imported = 0;
        let skipped = 0;

        // Save each found game
        for (const localGame of localGames) {
            const existingGame = await Game.findOne({
                userId: req.userId,
                title: localGame.title,
                source: 'local'
            });

            if (!existingGame) {
                const newGame = new Game({
                    userId: req.userId,
                    ...localGame
                });

                await newGame.save();
                imported++;
            } else {
                skipped++;
            }
        }

        res.json({
            message: 'Local scan completed',
            imported,
            skipped,
            total: localGames.length
        });
    } catch (error) {
        console.error('Local scan error:', error);
        res.status(500).json({ message: 'Failed to scan local games', error: error.message });
    }
});

// Add a game manually
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, playTime, genres, tags, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Game title is required' });
        }

        const newGame = new Game({
            userId: req.userId,
            title,
            playTime: playTime || 0,
            genres: genres || [],
            tags: tags || [],
            description: description || '',
            source: 'manual'
        });

        await newGame.save();

        res.status(201).json({
            message: 'Game added successfully',
            game: newGame
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'This game already exists in your library' });
        }
        console.error('Add game error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a game
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { playTime, genres, tags, lastPlayed } = req.body;

        const game = await Game.findOne({ _id: req.params.id, userId: req.userId });

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (playTime !== undefined) game.playTime = playTime;
        if (genres !== undefined) game.genres = genres;
        if (tags !== undefined) game.tags = tags;
        if (lastPlayed !== undefined) game.lastPlayed = lastPlayed;

        await game.save();

        res.json({
            message: 'Game updated successfully',
            game
        });
    } catch (error) {
        console.error('Update game error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a game
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const game = await Game.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        console.error('Delete game error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== PLAYTIME TRACKING ====================

// Start a play session
router.post('/:id/sessions/start', authMiddleware, async (req, res) => {
    try {
        const { default: PlaySession } = await import('../models/PlaySession.js');

        const game = await Game.findOne({ _id: req.params.id, userId: req.userId });
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Check if there's already an active session
        const activeSession = await PlaySession.findOne({
            userId: req.userId,
            gameId: req.params.id,
            isActive: true
        });

        if (activeSession) {
            return res.status(400).json({ message: 'A play session is already active for this game' });
        }

        const newSession = new PlaySession({
            userId: req.userId,
            gameId: req.params.id,
            startTime: new Date()
        });

        await newSession.save();

        res.status(201).json({
            message: 'Play session started',
            session: newSession
        });
    } catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Stop a play session
router.post('/:id/sessions/stop', authMiddleware, async (req, res) => {
    try {
        const { default: PlaySession } = await import('../models/PlaySession.js');

        const activeSession = await PlaySession.findOne({
            userId: req.userId,
            gameId: req.params.id,
            isActive: true
        });

        if (!activeSession) {
            return res.status(404).json({ message: 'No active play session found' });
        }

        activeSession.endTime = new Date();
        await activeSession.save();

        // Update game's total playtime
        const game = await Game.findById(req.params.id);
        if (game) {
            game.playTime += activeSession.duration;
            game.lastPlayed = activeSession.endTime;
            await game.save();
        }

        res.json({
            message: 'Play session stopped',
            session: activeSession,
            totalPlayTime: game.playTime
        });
    } catch (error) {
        console.error('Stop session error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get play session history for a game
router.get('/:id/sessions', authMiddleware, async (req, res) => {
    try {
        const { default: PlaySession } = await import('../models/PlaySession.js');

        const sessions = await PlaySession.find({
            userId: req.userId,
            gameId: req.params.id,
            isActive: false
        })
            .sort({ startTime: -1 })
            .limit(50);

        const totalPlayTime = sessions.reduce((sum, session) => sum + session.duration, 0);

        res.json({
            sessions,
            totalPlayTime,
            count: sessions.length
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get active session for a game
router.get('/:id/sessions/active', authMiddleware, async (req, res) => {
    try {
        const { default: PlaySession } = await import('../models/PlaySession.js');

        const activeSession = await PlaySession.findOne({
            userId: req.userId,
            gameId: req.params.id,
            isActive: true
        });

        res.json({
            hasActiveSession: !!activeSession,
            session: activeSession
        });
    } catch (error) {
        console.error('Get active session error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Manually update playtime
router.put('/:id/playtime', authMiddleware, async (req, res) => {
    try {
        const { playTime } = req.body;

        if (playTime === undefined || playTime < 0) {
            return res.status(400).json({ message: 'Valid playtime is required' });
        }

        const game = await Game.findOne({ _id: req.params.id, userId: req.userId });

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        game.playTime = playTime;
        await game.save();

        res.json({
            message: 'Playtime updated successfully',
            game
        });
    } catch (error) {
        console.error('Update playtime error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;

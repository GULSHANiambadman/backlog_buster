import Game from '../models/Game.js';
import User from '../models/User.js';

/**
 * Recommendation Engine
 * Provides intelligent game suggestions based on user data
 */
class RecommendationEngine {
    /**
     * Get game recommendations for a user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of recommended games with reasoning
     */
    async getRecommendations(userId) {
        try {
            const user = await User.findById(userId);
            const games = await Game.find({ userId }).sort({ playTime: 1 });

            if (games.length === 0) {
                return [];
            }

            const recommendations = [];

            // Strategy 1: Backlog games (least played)
            const backlogGames = this.getBacklogGames(games);
            recommendations.push(...backlogGames);

            // Strategy 2: Genre-based recommendations
            const genreMatches = this.getGenreBasedRecommendations(games, user);
            recommendations.push(...genreMatches);

            // Strategy 3: Neglected games (not played in a while)
            const neglectedGames = this.getNeglectedGames(games);
            recommendations.push(...neglectedGames);

            // Remove duplicates and limit to top 10
            const uniqueRecommendations = this.removeDuplicates(recommendations);
            return uniqueRecommendations.slice(0, 10);
        } catch (error) {
            console.error('Recommendation error:', error);
            throw error;
        }
    }

    /**
     * Get backlog games (games with least playtime)
     */
    getBacklogGames(games) {
        const backlog = games
            .filter(game => game.playTime < 60) // Less than 1 hour
            .slice(0, 5)
            .map(game => ({
                game: game,
                reason: 'Backlog Buster',
                description: `You've only played this for ${game.playTime} minutes. Give it a try!`,
                score: 10 - (game.playTime / 10)
            }));

        return backlog;
    }

    /**
     * Get recommendations based on favorite genres
     */
    getGenreBasedRecommendations(games, user) {
        if (!user.preferences || !user.preferences.favoriteGenres ||
            user.preferences.favoriteGenres.length === 0) {
            return [];
        }

        const favoriteGenres = user.preferences.favoriteGenres;

        // Find games with low playtime that match favorite genres
        const genreMatches = games
            .filter(game => {
                const hasMatchingGenre = game.genres.some(genre =>
                    favoriteGenres.some(fav =>
                        genre.toLowerCase().includes(fav.toLowerCase())
                    )
                );
                return hasMatchingGenre && game.playTime < 180; // Less than 3 hours
            })
            .slice(0, 5)
            .map(game => {
                const matchedGenres = game.genres.filter(genre =>
                    favoriteGenres.some(fav =>
                        genre.toLowerCase().includes(fav.toLowerCase())
                    )
                );
                return {
                    game: game,
                    reason: 'Genre Match',
                    description: `Matches your favorite genres: ${matchedGenres.join(', ')}`,
                    score: 8
                };
            });

        return genreMatches;
    }

    /**
     * Get neglected games (owned but not played recently)
     */
    getNeglectedGames(games) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const neglected = games
            .filter(game => {
                if (!game.lastPlayed) return game.playTime > 0;
                return game.lastPlayed < thirtyDaysAgo && game.playTime > 0;
            })
            .slice(0, 3)
            .map(game => ({
                game: game,
                reason: 'Revisit',
                description: game.lastPlayed
                    ? `Haven't played since ${game.lastPlayed.toLocaleDateString()}`
                    : 'Time to revisit this game!',
                score: 6
            }));

        return neglected;
    }

    /**
     * Remove duplicate game recommendations
     */
    removeDuplicates(recommendations) {
        const seen = new Set();
        return recommendations
            .filter(rec => {
                const gameId = rec.game._id.toString();
                if (seen.has(gameId)) {
                    return false;
                }
                seen.add(gameId);
                return true;
            })
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Get statistics for user's library
     */
    async getLibraryStats(userId) {
        try {
            const games = await Game.find({ userId });

            const totalGames = games.length;
            const totalPlaytime = games.reduce((sum, game) => sum + game.playTime, 0);
            const averagePlaytime = totalGames > 0 ? totalPlaytime / totalGames : 0;

            // Count games by source
            const bySource = {
                steam: games.filter(g => g.source === 'steam').length,
                local: games.filter(g => g.source === 'local').length,
                manual: games.filter(g => g.source === 'manual').length
            };

            // Genre distribution
            const genreCount = {};
            games.forEach(game => {
                game.genres.forEach(genre => {
                    genreCount[genre] = (genreCount[genre] || 0) + 1;
                });
            });

            const topGenres = Object.entries(genreCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([genre, count]) => ({ genre, count }));

            // Most played games
            const mostPlayed = games
                .sort((a, b) => b.playTime - a.playTime)
                .slice(0, 5)
                .map(game => ({
                    title: game.title,
                    playTime: game.playTime
                }));

            return {
                totalGames,
                totalPlaytime,
                averagePlaytime,
                bySource,
                topGenres,
                mostPlayed
            };
        } catch (error) {
            console.error('Stats error:', error);
            throw error;
        }
    }
}

export default new RecommendationEngine();

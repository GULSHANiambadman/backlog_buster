import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationsAPI } from '../utils/api';
import StatsCard from '../components/StatsCard';
import './Dashboard.css';

function Dashboard() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchStats();
    }, [isAuthenticated]);

    const fetchStats = async () => {
        try {
            const response = await recommendationsAPI.getStats();
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner" style={{ width: '50px', height: '50px' }}></div>
                        <p>Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    const formatPlaytime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        return `${hours}h`;
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header fade-in">
                    <h1>Welcome back, <span className="gradient-text">{user?.username}</span>! 🎮</h1>
                    <p>Here's an overview of your gaming library</p>
                </div>

                {stats ? (
                    <>
                        <div className="stats-grid grid grid-2 fade-in">
                            <StatsCard
                                title="Total Games"
                                value={stats.totalGames}
                                subtitle="Games in your library"
                                icon="🎮"
                            />
                            <StatsCard
                                title="Total Playtime"
                                value={formatPlaytime(stats.totalPlaytime)}
                                subtitle="Hours spent gaming"
                                icon="⏱️"
                            />
                            <StatsCard
                                title="Manual Games"
                                value={stats.bySource.manual}
                                subtitle="Added manually"
                                icon="🎯"
                            />
                            <StatsCard
                                title="Local Games"
                                value={stats.bySource.local}
                                subtitle="Detected locally"
                                icon="💻"
                            />
                        </div>

                        {stats.topGenres && stats.topGenres.length > 0 && (
                            <div className="section glass-card fade-in">
                                <h2>Top Genres</h2>
                                <div className="genre-chart">
                                    {stats.topGenres.map((genre, index) => (
                                        <div key={index} className="genre-bar-container">
                                            <div className="genre-bar-label">
                                                <span className="genre-name">{genre.genre}</span>
                                                <span className="genre-count">{genre.count} games</span>
                                            </div>
                                            <div className="genre-bar-track">
                                                <div
                                                    className="genre-bar-fill"
                                                    style={{
                                                        width: `${(genre.count / stats.totalGames) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stats.mostPlayed && stats.mostPlayed.length > 0 && (
                            <div className="section glass-card fade-in">
                                <h2>Most Played Games</h2>
                                <div className="most-played-list">
                                    {stats.mostPlayed.map((game, index) => (
                                        <div key={index} className="most-played-item">
                                            <span className="rank">#{index + 1}</span>
                                            <span className="game-name">{game.title}</span>
                                            <span className="game-playtime">{formatPlaytime(game.playTime)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="action-buttons fade-in">
                            <button
                                className="btn btn-primary btn-large"
                                onClick={() => navigate('/library')}
                            >
                                📚 View Full Library
                            </button>
                            <button
                                className="btn btn-accent btn-large"
                                onClick={() => navigate('/recommendations')}
                            >
                                ✨ Get Recommendations
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-state glass-card">
                        <h2>No games in your library yet</h2>
                        <p>Start by scanning for local games or adding them manually</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/library')}
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;

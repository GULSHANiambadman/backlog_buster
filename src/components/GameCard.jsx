import { useState, useEffect } from 'react';
import { gamesAPI } from '../utils/api';
import './GameCard.css';

function GameCard({ game, onUpdate, onDelete, onSessionUpdate }) {
    const [activeSession, setActiveSession] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        checkActiveSession();
    }, [game._id]);

    useEffect(() => {
        let interval;
        if (isPlaying && activeSession) {
            interval = setInterval(() => {
                const startTime = new Date(activeSession.startTime);
                const now = new Date();
                const elapsed = Math.floor((now - startTime) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, activeSession]);

    const checkActiveSession = async () => {
        try {
            const response = await gamesAPI.getActiveSession(game._id);
            if (response.data.hasActiveSession) {
                setActiveSession(response.data.session);
                setIsPlaying(true);
                const startTime = new Date(response.data.session.startTime);
                const now = new Date();
                const elapsed = Math.floor((now - startTime) / 1000);
                setElapsedTime(elapsed);
            }
        } catch (error) {
            console.error('Failed to check active session:', error);
        }
    };

    const handleStartSession = async () => {
        try {
            const response = await gamesAPI.startSession(game._id);
            setActiveSession(response.data.session);
            setIsPlaying(true);
            setElapsedTime(0);
        } catch (error) {
            console.error('Failed to start session:', error);
            alert(error.response?.data?.message || 'Failed to start session');
        }
    };

    const handleStopSession = async () => {
        try {
            await gamesAPI.stopSession(game._id);
            setActiveSession(null);
            setIsPlaying(false);
            setElapsedTime(0);
            if (onSessionUpdate) {
                onSessionUpdate();
            }
        } catch (error) {
            console.error('Failed to stop session:', error);
            alert('Failed to stop session');
        }
    };

    const formatPlayTime = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m`;
    };

    const formatElapsedTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getSourceBadge = (source) => {
        const badges = {
            steam: { icon: '🎮', color: '#1b2838', label: 'Steam' },
            local: { icon: '💻', color: '#7c3aed', label: 'Local' },
            manual: { icon: '✏️', color: '#3b82f6', label: 'Manual' }
        };
        return badges[source] || badges.manual;
    };

    const badge = getSourceBadge(game.source);

    return (
        <div className={`game-card glass-card ${isPlaying ? 'playing' : ''}`}>
            {game.imageUrl ? (
                <div className="game-image">
                    <img src={game.imageUrl} alt={game.title} />
                </div>
            ) : (
                <div className="game-image-placeholder">
                    <span>🎮</span>
                </div>
            )}

            <div className="game-content">
                <div className="game-header">
                    <h3 className="game-title">{game.title}</h3>
                    <div className="source-badge" style={{ background: badge.color }}>
                        <span>{badge.icon}</span>
                        <span className="badge-label">{badge.label}</span>
                    </div>
                </div>

                <div className="game-stats">
                    <div className="stat">
                        <span className="stat-label">Playtime:</span>
                        <span className="stat-value">{formatPlayTime(game.playTime)}</span>
                    </div>
                    {game.lastPlayed && (
                        <div className="stat">
                            <span className="stat-label">Last Played:</span>
                            <span className="stat-value">
                                {new Date(game.lastPlayed).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Timer Controls */}
                <div className="timer-controls">
                    {isPlaying ? (
                        <>
                            <div className="live-timer">
                                <span className="timer-icon pulse">⏱️</span>
                                <span className="timer-display">{formatElapsedTime(elapsedTime)}</span>
                            </div>
                            <button
                                className="btn btn-stop"
                                onClick={handleStopSession}
                            >
                                ⏹️ Stop
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn-play"
                            onClick={handleStartSession}
                        >
                            ▶️ Play
                        </button>
                    )}
                </div>

                {game.genres && game.genres.length > 0 && (
                    <div className="game-genres">
                        {game.genres.slice(0, 3).map((genre, index) => (
                            <span key={index} className="genre-tag">{genre}</span>
                        ))}
                    </div>
                )}

                {game.description && (
                    <p className="game-description">
                        {game.description.slice(0, 100)}
                        {game.description.length > 100 ? '...' : ''}
                    </p>
                )}
            </div>
        </div>
    );
}

export default GameCard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationsAPI } from '../utils/api';
import GameCard from '../components/GameCard';
import './Recommendations.css';

function Recommendations() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchRecommendations();
    }, [isAuthenticated]);

    const fetchRecommendations = async () => {
        try {
            const response = await recommendationsAPI.get();
            setRecommendations(response.data.recommendations);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getReasonIcon = (reason) => {
        const icons = {
            'Backlog Buster': '📚',
            'Genre Match': '🎯',
            'Revisit': '🔄',
        };
        return icons[reason] || '✨';
    };

    const getReasonColor = (reason) => {
        const colors = {
            'Backlog Buster': 'hsl(261, 80%, 60%)',
            'Genre Match': 'hsl(320, 85%, 60%)',
            'Revisit': 'hsl(142, 70%, 50%)',
        };
        return colors[reason] || 'hsl(38, 95%, 55%)';
    };

    return (
        <div className="recommendations-page">
            <div className="container">
                <div className="recommendations-header fade-in">
                    <h1><span className="gradient-text">Game Recommendations</span> ✨</h1>
                    <p>Personalized suggestions based on your gaming habits and preferences</p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner" style={{ width: '50px', height: '50px' }}></div>
                        <p>Analyzing your library...</p>
                    </div>
                ) : recommendations.length > 0 ? (
                    <div className="recommendations-list fade-in">
                        {recommendations.map((rec, index) => (
                            <div key={rec.game._id} className="recommendation-item glass-card">
                                <div className="recommendation-badge" style={{ background: getReasonColor(rec.reason) }}>
                                    <span className="badge-icon">{getReasonIcon(rec.reason)}</span>
                                    <span className="badge-text">{rec.reason}</span>
                                    <span className="badge-score">Score: {rec.score}/10</span>
                                </div>
                                <div className="recommendation-content">
                                    <GameCard game={rec.game} />
                                    <div className="recommendation-description">
                                        <h3>Why we recommend this:</h3>
                                        <p>{rec.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state glass-card">
                        <h2>No recommendations available</h2>
                        <p>Add some games to your library to get personalized recommendations!</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/library')}
                        >
                            Go to Library
                        </button>
                    </div>
                )}

                <div className="recommendations-info glass-card fade-in">
                    <h3>How recommendations work</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-icon">📚</span>
                            <div>
                                <h4>Backlog Buster</h4>
                                <p>Games you own but haven't played much</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">🎯</span>
                            <div>
                                <h4>Genre Match</h4>
                                <p>Games matching your favorite genres</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">🔄</span>
                            <div>
                                <h4>Revisit</h4>
                                <p>Games you haven't played in a while</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Recommendations;

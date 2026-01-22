import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gamesAPI } from '../utils/api';
import GameCard from '../components/GameCard';
import './GameLibrary.css';

function GameLibrary() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('title');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPathInput, setShowPathInput] = useState(false);
    const [customPaths, setCustomPaths] = useState([]);
    const [pathInput, setPathInput] = useState('');
    const [showAddGame, setShowAddGame] = useState(false);
    const [newGame, setNewGame] = useState({ title: '', genres: '', tags: '', description: '' });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchGames();
    }, [isAuthenticated, filter, sortBy]);

    const fetchGames = async () => {
        try {
            const params = {};
            if (filter !== 'all') params.source = filter;
            params.sort = sortBy;

            const response = await gamesAPI.getAll(params);
            setGames(response.data.games);
        } catch (error) {
            console.error('Failed to fetch games:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScanLocal = async () => {
        setSyncing(true);
        try {
            const paths = customPaths.length > 0 ? customPaths : null;
            const response = await gamesAPI.scanLocal(paths);
            alert(`Local scan complete! Found: ${response.data.imported} new games`);
            fetchGames();
            setShowPathInput(false);
        } catch (error) {
            alert('Failed to scan local games: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleAddGame = async () => {
        if (!newGame.title.trim()) {
            alert('Please enter a game title');
            return;
        }

        try {
            await gamesAPI.addGame({
                title: newGame.title,
                genres: newGame.genres ? newGame.genres.split(',').map(g => g.trim()) : [],
                tags: newGame.tags ? newGame.tags.split(',').map(t => t.trim()) : [],
                description: newGame.description
            });
            alert('Game added successfully!');
            setNewGame({ title: '', genres: '', tags: '', description: '' });
            setShowAddGame(false);
            fetchGames();
        } catch (error) {
            alert('Failed to add game: ' + error.message);
        }
    };

    const filteredGames = games.filter(game =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="library-page">
            <div className="container">
                <div className="library-header fade-in">
                    <div>
                        <h1>My Game Library</h1>
                        <p>{games.length} games in your collection</p>
                    </div>
                    <div className="sync-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddGame(!showAddGame)}
                        >
                            ➕ {showAddGame ? 'Cancel' : 'Add Game'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowPathInput(!showPathInput)}
                        >
                            📂 {showPathInput ? 'Hide' : 'Set'} Custom Paths
                        </button>
                        <button
                            className="btn btn-accent"
                            onClick={handleScanLocal}
                            disabled={syncing}
                        >
                            {syncing ? <span className="spinner"></span> : '💻 Scan Local Games'}
                        </button>
                    </div>
                </div>

                {showAddGame && (
                    <div className="glass-card fade-in" style={{ marginBottom: '1rem' }}>
                        <h3>Add Game Manually</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Add a game to your library manually
                        </p>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Game Title *"
                                value={newGame.title}
                                onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                            />
                            <input
                                type="text"
                                className="input"
                                placeholder="Genres (comma separated)"
                                value={newGame.genres}
                                onChange={(e) => setNewGame({ ...newGame, genres: e.target.value })}
                            />
                            <input
                                type="text"
                                className="input"
                                placeholder="Tags (comma separated)"
                                value={newGame.tags}
                                onChange={(e) => setNewGame({ ...newGame, tags: e.target.value })}
                            />
                            <textarea
                                className="input"
                                placeholder="Description (optional)"
                                value={newGame.description}
                                onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                                rows="3"
                                style={{ resize: 'vertical' }}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleAddGame}
                            >
                                Add to Library
                            </button>
                        </div>
                    </div>
                )}


                {showPathInput && (
                    <div className="glass-card fade-in" style={{ marginBottom: '1rem' }}>
                        <h3>Custom Scan Paths</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Add directories where your games are installed (e.g., /run/media/navneet/Games, ~/Steam)
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="/path/to/games"
                                value={pathInput}
                                onChange={(e) => setPathInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && pathInput.trim()) {
                                        setCustomPaths([...customPaths, pathInput.trim()]);
                                        setPathInput('');
                                    }
                                }}
                                style={{ flex: 1 }}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (pathInput.trim()) {
                                        setCustomPaths([...customPaths, pathInput.trim()]);
                                        setPathInput('');
                                    }
                                }}
                            >
                                Add Path
                            </button>
                        </div>
                        {customPaths.length > 0 && (
                            <div>
                                <strong>Paths to scan:</strong>
                                <ul style={{ marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
                                    {customPaths.map((path, index) => (
                                        <li key={index} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.5rem',
                                            marginBottom: '0.5rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '0.5rem'
                                        }}>
                                            <code>{path}</code>
                                            <button
                                                className="btn btn-small"
                                                onClick={() => setCustomPaths(customPaths.filter((_, i) => i !== index))}
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="library-controls glass-card fade-in">
                    <div className="search-box">
                        <input
                            type="text"
                            className="input"
                            placeholder="🔍 Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'local' ? 'active' : ''}`}
                            onClick={() => setFilter('local')}
                        >
                            Local
                        </button>
                        <button
                            className={`filter-btn ${filter === 'manual' ? 'active' : ''}`}
                            onClick={() => setFilter('manual')}
                        >
                            Manual
                        </button>
                    </div>

                    <select
                        className="sort-select input"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="title">Sort by Name</option>
                        <option value="playtime">Sort by Playtime</option>
                        <option value="recent">Sort by Recently Added</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner" style={{ width: '50px', height: '50px' }}></div>
                        <p>Loading your games...</p>
                    </div>
                ) : filteredGames.length > 0 ? (
                    <div className="games-grid grid grid-3 fade-in">
                        {filteredGames.map(game => (
                            <GameCard
                                key={game._id}
                                game={game}
                                onSessionUpdate={fetchGames}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state glass-card">
                        <h2>No games found</h2>
                        <p>
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Scan for local games or add them manually to get started'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GameLibrary;

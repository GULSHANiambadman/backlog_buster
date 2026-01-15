# Game Library & Recommendation Website

A modern MERN stack application for managing your game library and getting intelligent recommendations on what to play next.

## 🎮 Features

- **Dual Library Sources**: Sync games from Steam API or scan your local disk for installed games
- **Playtime Tracking**: Monitor and analyze your gaming habits with comprehensive statistics
- **Smart Recommendations**: AI-powered suggestions based on:
  - Backlog games (least played titles)
  - Genre preferences
  - Neglected games you haven't played recently
- **Beautiful UI**: Modern dark theme with glassmorphism effects and smooth animations
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **JWT** authentication
- **Steam Web API** integration
- **Local file system scanning**

### Frontend
- **React** (with Vite)
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **Modern CSS** with custom properties and animations

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory (copy from `.env.example`):
```env
MONGODB_URI=mongodb://localhost:27017/game-library
JWT_SECRET=your_jwt_secret_key
PORT=5000
STEAM_API_KEY=your_steam_api_key_optional
GAME_SCAN_PATHS=/home/your-username/.steam/steam/steamapps/common,/home/your-username/Games
```

4. Start MongoDB (if running locally):
```bash
sudo systemctl start mongodb
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎯 Usage

### 1. Create an Account
- Navigate to the homepage
- Click "Get Started" or "Sign Up"
- Enter your details and optionally select your favorite game genres

### 2. Sync Your Games

**Option A: Steam Integration**
- Get your Steam API key from https://steamcommunity.com/dev/apikey
- Get your Steam ID (64-bit) from your profile
- Update your preferences with Steam credentials
- Click "Sync Steam" in the library page

**Option B: Local Scanning**
- Click "Scan Local" in the library page
- The system will scan common game installation directories
- Found games will be automatically added to your library

**Option C: Manual Entry**
- Use the API to manually add games with custom details

### 3. View Your Dashboard
- See total games count and playtime statistics
- View top genres from your library
- Check your most played games

### 4. Get Recommendations
- Navigate to the Recommendations page
- View personalized game suggestions with explanations
- Each recommendation shows why it was suggested

## 🔧 Configuration

### Steam API Setup
1. Visit https://steamcommunity.com/dev/apikey
2. Create an API key (you'll need a Steam account)
3. Add the key to your `.env` file or update it in your user preferences

### Local Game Scan Paths
Edit the `GAME_SCAN_PATHS` in your `.env` file to include custom game directories:
```env
GAME_SCAN_PATHS=/path/to/steam/common,/path/to/epic/games,/path/to/custom
```

## 📱 Screenshots

The application features:
- Clean, modern dark theme
- Glassmorphism card designs
- Smooth animations and transitions
- Responsive layouts for all screen sizes
- Interactive data visualizations

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/preferences` - Update user preferences

### Games
- `GET /api/games` - Get all user games
- `POST /api/games/sync-steam` - Sync from Steam
- `POST /api/games/scan-local` - Scan local disk
- `POST /api/games` - Add game manually
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game

### Recommendations
- `GET /api/recommendations` - Get game recommendations
- `GET /api/recommendations/stats` - Get library statistics

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongodb`
- Check the connection string in `.env`

### Steam Sync Not Working
- Verify your Steam API key is valid
- Ensure your Steam profile is public
- Check if you have the correct Steam ID (64-bit format)

### Local Scan Not Finding Games
- Update `GAME_SCAN_PATHS` with your actual game directories
- Ensure the application has read permissions for those directories

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ using the MERN stack

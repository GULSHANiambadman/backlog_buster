import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Local Game Scanner Service
 * Scans common game installation directories for installed games
 */
class LocalScanService {
    constructor() {
        this.scanPaths = this.getScanPaths();
    }

    /**
     * Get scan paths from environment or use defaults
     */
    getScanPaths() {
        const envPaths = process.env.GAME_SCAN_PATHS;
        if (envPaths) {
            return envPaths.split(',').map(p => p.trim());
        }

        // Default paths for Linux
        return [
            path.join(process.env.HOME || '~', '.steam/steam/steamapps/common'),
            path.join(process.env.HOME || '~', '.local/share/Steam/steamapps/common'),
            path.join(process.env.HOME || '~', 'Games'),
            '/usr/share/games',
            '/usr/local/games'
        ];
    }

    /**
     * Expand home directory in path
     */
    expandHomePath(filePath) {
        if (filePath.startsWith('~')) {
            return path.join(process.env.HOME || '', filePath.slice(1));
        }
        return filePath;
    }

    /**
     * Check if a directory likely contains a game
     */
    async isGameDirectory(dirPath) {
        try {
            const files = await fs.readdir(dirPath);

            // Look for common game executable patterns
            const gamePatterns = [
                /\.exe$/i,     // Windows executables
                /\.sh$/i,      // Shell scripts
                /\.x86_64$/i,  // Linux executables
                /\.x86$/i,
                /^start/i,     // Start scripts
                /^launch/i,    // Launch scripts
                /^run/i        // Run scripts
            ];

            // Look for game-related files
            const hasGameFile = files.some(file =>
                gamePatterns.some(pattern => pattern.test(file))
            );

            // Additional checks for manifest or config files
            const hasManifest = files.some(file =>
                /manifest/i.test(file) ||
                /config/i.test(file) ||
                /\.acf$/i.test(file)
            );

            return hasGameFile || hasManifest;
        } catch (error) {
            return false;
        }
    }



    /**
     * Scan directories for installed games
     */
    async scanForGames() {
        return await this._scanDirectories(this.scanPaths);
    }

    /**
     * Scan custom paths provided by user
     */
    async scanCustomPaths(customPaths) {
        return await this._scanDirectories(customPaths);
    }

    /**
     * Internal method to scan given paths
     */
    async _scanDirectories(pathsToScan) {
        const foundGames = [];

        for (const scanPath of pathsToScan) {
            try {
                const expandedPath = this.expandHomePath(scanPath);

                // Check if directory exists
                try {
                    await fs.access(expandedPath);
                } catch {
                    console.log(`Scan path not found: ${expandedPath}`);
                    continue;
                }

                const entries = await fs.readdir(expandedPath, { withFileTypes: true });

                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        const gamePath = path.join(expandedPath, entry.name);
                        const isGame = await this.isGameDirectory(gamePath);

                        if (isGame) {
                            foundGames.push({
                                title: entry.name,
                                installPath: gamePath,
                                source: 'local',
                                playTime: 0, // Cannot determine playtime from local scan
                                genres: [],
                                tags: ['Local Game'],
                                imageUrl: '',
                                description: `Game found in: ${gamePath}`
                            });
                        }
                    }
                }
            } catch (error) {
                console.error(`Error scanning ${scanPath}:`, error.message);
            }
        }

        console.log(`Found ${foundGames.length} local games`);
        return foundGames;
    }

    /**
     * Get file modification time as a proxy for last played
     */
    async getLastModified(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.mtime;
        } catch {
            return null;
        }
    }
}

export default new LocalScanService();

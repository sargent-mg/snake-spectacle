import { 
  User, 
  LeaderboardEntry, 
  ActivePlayer, 
  AuthResponse, 
  ApiResponse,
  GameMode,
  Position,
  Direction
} from '@/types/game';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const STORAGE_KEYS = {
  USER: 'snake_game_user',
  LEADERBOARD: 'snake_game_leaderboard',
};

// Mock data
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'NeonMaster', score: 2450, mode: 'walls', date: '2024-01-15' },
  { id: '2', username: 'PixelKing', score: 2100, mode: 'passthrough', date: '2024-01-14' },
  { id: '3', username: 'ArcadeQueen', score: 1890, mode: 'walls', date: '2024-01-13' },
  { id: '4', username: 'RetroGamer', score: 1750, mode: 'passthrough', date: '2024-01-12' },
  { id: '5', username: 'SnakeCharmer', score: 1620, mode: 'walls', date: '2024-01-11' },
  { id: '6', username: 'BitRunner', score: 1500, mode: 'passthrough', date: '2024-01-10' },
  { id: '7', username: 'VectorViper', score: 1380, mode: 'walls', date: '2024-01-09' },
  { id: '8', username: 'GlitchGuru', score: 1250, mode: 'passthrough', date: '2024-01-08' },
  { id: '9', username: 'CyberSnake', score: 1100, mode: 'walls', date: '2024-01-07' },
  { id: '10', username: 'NeonByte', score: 950, mode: 'passthrough', date: '2024-01-06' },
];

// Generate mock active players with simulated game states
const generateMockActivePlayers = (): ActivePlayer[] => {
  const players: ActivePlayer[] = [
    {
      id: 'active-1',
      username: 'LivePlayer1',
      score: Math.floor(Math.random() * 500) + 100,
      mode: 'walls',
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      food: { x: 15, y: 12 },
      direction: 'RIGHT',
      startedAt: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 'active-2',
      username: 'ProGamer99',
      score: Math.floor(Math.random() * 800) + 200,
      mode: 'passthrough',
      snake: [{ x: 5, y: 8 }, { x: 5, y: 9 }, { x: 5, y: 10 }],
      food: { x: 12, y: 5 },
      direction: 'UP',
      startedAt: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 'active-3',
      username: 'SnakeMaster',
      score: Math.floor(Math.random() * 1000) + 300,
      mode: 'walls',
      snake: [{ x: 15, y: 15 }, { x: 14, y: 15 }, { x: 13, y: 15 }, { x: 12, y: 15 }],
      food: { x: 3, y: 7 },
      direction: 'RIGHT',
      startedAt: new Date(Date.now() - 600000).toISOString(),
    },
  ];
  return players;
};

// Mock users database
const mockUsers: Map<string, { user: User; password: string }> = new Map();

// Initialize with some mock users
mockUsers.set('demo@snake.game', {
  user: {
    id: 'demo-user-1',
    username: 'DemoPlayer',
    email: 'demo@snake.game',
    createdAt: '2024-01-01',
  },
  password: 'demo123',
});

/**
 * Centralized API service for all backend calls
 * All methods are async to simulate real API behavior
 */
export const api = {
  // ==================== AUTH ====================
  
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(500);
    
    const userData = mockUsers.get(email);
    
    if (!userData) {
      return { success: false, error: 'User not found' };
    }
    
    if (userData.password !== password) {
      return { success: false, error: 'Invalid password' };
    }
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData.user));
    return { success: true, user: userData.user };
  },

  async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    await delay(500);
    
    if (mockUsers.has(email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    // Check if username is taken
    for (const [, data] of mockUsers) {
      if (data.user.username.toLowerCase() === username.toLowerCase()) {
        return { success: false, error: 'Username already taken' };
      }
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.set(email, { user: newUser, password });
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    
    return { success: true, user: newUser };
  },

  async logout(): Promise<ApiResponse<null>> {
    await delay(200);
    localStorage.removeItem(STORAGE_KEYS.USER);
    return { success: true };
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(100);
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      return { success: true, data: JSON.parse(stored) };
    }
    return { success: true, data: null };
  },

  // ==================== LEADERBOARD ====================

  async getLeaderboard(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    await delay(300);
    
    let leaderboard = [...mockLeaderboard];
    
    // Load any saved scores from localStorage
    const savedLeaderboard = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (savedLeaderboard) {
      const saved = JSON.parse(savedLeaderboard) as LeaderboardEntry[];
      leaderboard = [...saved, ...leaderboard];
    }
    
    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Filter by mode if specified
    if (mode) {
      leaderboard = leaderboard.filter(entry => entry.mode === mode);
    }
    
    // Return top 10
    return { success: true, data: leaderboard.slice(0, 10) };
  },

  async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    await delay(300);
    
    const userResponse = await this.getCurrentUser();
    if (!userResponse.data) {
      return { success: false, error: 'Must be logged in to submit score' };
    }
    
    const entry: LeaderboardEntry = {
      id: `score-${Date.now()}`,
      username: userResponse.data.username,
      score,
      mode,
      date: new Date().toISOString().split('T')[0],
    };
    
    // Save to localStorage
    const savedLeaderboard = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    const leaderboard = savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
    leaderboard.push(entry);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    
    return { success: true, data: entry };
  },

  // ==================== ACTIVE PLAYERS (SPECTATOR) ====================

  async getActivePlayers(): Promise<ApiResponse<ActivePlayer[]>> {
    await delay(200);
    return { success: true, data: generateMockActivePlayers() };
  },

  async getPlayerById(playerId: string): Promise<ApiResponse<ActivePlayer | null>> {
    await delay(100);
    const players = generateMockActivePlayers();
    const player = players.find(p => p.id === playerId) || null;
    return { success: true, data: player };
  },

  // Simulate player movement for spectator mode
  simulatePlayerMove(player: ActivePlayer, gridSize: number): ActivePlayer {
    const newSnake = [...player.snake];
    const head = { ...newSnake[0] };
    
    // Randomly change direction sometimes
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const opposites: Record<Direction, Direction> = {
      'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT'
    };
    
    let newDirection = player.direction;
    if (Math.random() < 0.1) {
      const validDirections = directions.filter(d => d !== opposites[player.direction]);
      newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
    }
    
    // Move head
    switch (newDirection) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }
    
    // Handle passthrough mode
    if (player.mode === 'passthrough') {
      if (head.x < 0) head.x = gridSize - 1;
      if (head.x >= gridSize) head.x = 0;
      if (head.y < 0) head.y = gridSize - 1;
      if (head.y >= gridSize) head.y = 0;
    }
    
    newSnake.unshift(head);
    
    // Check if food eaten
    let newFood = player.food;
    let newScore = player.score;
    if (head.x === player.food.x && head.y === player.food.y) {
      newScore += 10;
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
    } else {
      newSnake.pop();
    }
    
    return {
      ...player,
      snake: newSnake,
      food: newFood,
      direction: newDirection,
      score: newScore,
    };
  },
};

export default api;

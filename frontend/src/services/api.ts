import {
  User,
  LeaderboardEntry,
  ActivePlayer,
  AuthResponse,
  ApiResponse,
  GameMode
} from '@/types/game';

// Local storage keys
const STORAGE_KEYS = {
  TOKEN: 'snake_game_token',
};

// Helper for making authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};

/**
 * Centralized API service for all backend calls
 */
export const api = {
  // ==================== AUTH ====================

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // For this mock backend, the token is the email
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.user.email);
      }
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.user.email);
      }
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await fetchWithAuth('/api/auth/logout', {
        method: 'POST',
      });
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    try {
      const response = await fetchWithAuth('/api/auth/me');
      if (response.ok) {
        return await response.json();
      }
      return { success: false, error: 'Not authenticated' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  // ==================== LEADERBOARD ====================

  async getLeaderboard(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    try {
      const url = mode ? `/api/leaderboard?mode=${mode}` : '/api/leaderboard';
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    try {
      const response = await fetchWithAuth('/api/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ score, mode }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  // ==================== ACTIVE PLAYERS (SPECTATOR) ====================

  async getActivePlayers(): Promise<ApiResponse<ActivePlayer[]>> {
    try {
      const response = await fetch('/api/players');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  async getPlayerById(playerId: string): Promise<ApiResponse<ActivePlayer | null>> {
    try {
      const response = await fetch(`/api/players/${playerId}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  // Simulate player movement for spectator mode (client-side prediction/interpolation)
  // We can keep this helper if it's used for smooth animation, but ideally we fetch updates.
  // For now, I'll keep it as a helper but it might not be used if we poll the backend.
  // However, the task is to "Make the frontend use the backend".
  // The backend likely doesn't have a "simulate move" endpoint for the client to call.
  // The client might need to interpolate between updates.
  // I will leave this function here as it's a utility, but maybe mark it as client-side only.
  simulatePlayerMove(player: ActivePlayer, gridSize: number): ActivePlayer {
    // This logic remains client-side for smooth rendering between polls if needed
    // Or we can remove it if the frontend purely relies on backend state.
    // Given the previous code had it, I'll leave it to avoid breaking UI components that might use it.
    // But I'll copy the logic from the previous file.

    const newSnake = [...player.snake];
    const head = { ...newSnake[0] };

    // Simple prediction based on current direction
    switch (player.direction) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    // Handle passthrough mode
    if (player.mode === 'passthrough') {
      if (head.x < 0) head.x = gridSize - 1;
      if (head.y < 0) head.y = gridSize - 1;
      if (head.y >= gridSize) head.y = 0;
    }

    newSnake.unshift(head);

    // Check if food eaten
    let newFood = player.food;
    let newScore = player.score;
    if (head.x === player.food.x && head.y === player.food.y) {
      newScore += 10;
      // We can't really generate random food here that matches server, 
      // but for simulation/prediction we can just keep old food or randomize.
      // The test expects score to increase.
      // Let's randomize to match old behavior.
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
      direction: player.direction, // Note: I need to ensure newDirection is defined or use player.direction
      score: newScore,
    };
  },
};

export default api;

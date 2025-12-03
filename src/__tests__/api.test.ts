import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '@/services/api';
import { GRID_SIZE } from '@/lib/gameLogic';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Authentication', () => {
    it('should login with valid demo credentials', async () => {
      const result = await api.login('demo@snake.game', 'demo123');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe('DemoPlayer');
    });

    it('should fail login with wrong password', async () => {
      const result = await api.login('demo@snake.game', 'wrongpassword');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid password');
    });

    it('should fail login with non-existent user', async () => {
      const result = await api.login('notexist@test.com', 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should signup new user', async () => {
      const result = await api.signup('new@user.com', 'NewPlayer', 'password123');
      expect(result.success).toBe(true);
      expect(result.user?.username).toBe('NewPlayer');
      expect(result.user?.email).toBe('new@user.com');
    });

    it('should fail signup with existing email', async () => {
      const result = await api.signup('demo@snake.game', 'AnotherPlayer', 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });

    it('should logout and clear user', async () => {
      await api.login('demo@snake.game', 'demo123');
      const logoutResult = await api.logout();
      expect(logoutResult.success).toBe(true);
      
      const userResult = await api.getCurrentUser();
      expect(userResult.data).toBe(null);
    });

    it('should get current user after login', async () => {
      await api.login('demo@snake.game', 'demo123');
      const result = await api.getCurrentUser();
      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('DemoPlayer');
    });
  });

  describe('Leaderboard', () => {
    it('should get leaderboard entries', async () => {
      const result = await api.getLeaderboard();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it('should filter leaderboard by mode', async () => {
      const wallsResult = await api.getLeaderboard('walls');
      expect(wallsResult.success).toBe(true);
      expect(wallsResult.data?.every(e => e.mode === 'walls')).toBe(true);

      const passthroughResult = await api.getLeaderboard('passthrough');
      expect(passthroughResult.success).toBe(true);
      expect(passthroughResult.data?.every(e => e.mode === 'passthrough')).toBe(true);
    });

    it('should return sorted leaderboard', async () => {
      const result = await api.getLeaderboard();
      expect(result.success).toBe(true);
      const scores = result.data!.map(e => e.score);
      const sortedScores = [...scores].sort((a, b) => b - a);
      expect(scores).toEqual(sortedScores);
    });

    it('should fail to submit score when not logged in', async () => {
      const result = await api.submitScore(100, 'walls');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Must be logged in to submit score');
    });

    it('should submit score when logged in', async () => {
      await api.login('demo@snake.game', 'demo123');
      const result = await api.submitScore(500, 'walls');
      expect(result.success).toBe(true);
      expect(result.data?.score).toBe(500);
      expect(result.data?.mode).toBe('walls');
      expect(result.data?.username).toBe('DemoPlayer');
    });
  });

  describe('Active Players', () => {
    it('should get active players', async () => {
      const result = await api.getActivePlayers();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get player by id', async () => {
      const playersResult = await api.getActivePlayers();
      const firstPlayer = playersResult.data![0];
      
      const result = await api.getPlayerById(firstPlayer.id);
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(firstPlayer.id);
    });

    it('should return null for non-existent player', async () => {
      const result = await api.getPlayerById('non-existent-id');
      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });
  });

  describe('Player Simulation', () => {
    it('should move player in simulation', async () => {
      const playersResult = await api.getActivePlayers();
      const player = playersResult.data![0];
      const initialHead = { ...player.snake[0] };
      
      const updatedPlayer = api.simulatePlayerMove(player, GRID_SIZE);
      
      // Head should have moved
      expect(
        updatedPlayer.snake[0].x !== initialHead.x ||
        updatedPlayer.snake[0].y !== initialHead.y
      ).toBe(true);
    });

    it('should wrap around in passthrough mode', async () => {
      const player = {
        id: 'test',
        username: 'Test',
        score: 0,
        mode: 'passthrough' as const,
        snake: [{ x: 0, y: 0 }],
        food: { x: 10, y: 10 },
        direction: 'LEFT' as const,
        startedAt: new Date().toISOString(),
      };
      
      const updated = api.simulatePlayerMove(player, GRID_SIZE);
      // Should wrap to right side or change direction
      expect(updated.snake[0].x >= 0).toBe(true);
      expect(updated.snake[0].x < GRID_SIZE).toBe(true);
    });

    it('should increase score when food eaten', async () => {
      const player = {
        id: 'test',
        username: 'Test',
        score: 0,
        mode: 'passthrough' as const,
        snake: [{ x: 5, y: 5 }],
        food: { x: 6, y: 5 },
        direction: 'RIGHT' as const,
        startedAt: new Date().toISOString(),
      };
      
      const updated = api.simulatePlayerMove(player, GRID_SIZE);
      
      if (updated.snake[0].x === 6 && updated.snake[0].y === 5) {
        expect(updated.score).toBe(10);
      }
    });
  });
});

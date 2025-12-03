import { describe, it, expect } from 'vitest';
import {
  getOppositeDirection,
  isValidDirectionChange,
  generateFood,
  moveSnake,
  checkSelfCollision,
  checkFoodCollision,
  growSnake,
  calculateSpeed,
  createInitialGameState,
  gameStep,
  handleDirectionChange,
  GRID_SIZE,
  INITIAL_SPEED,
  MIN_SPEED,
} from '@/lib/gameLogic';
import { Direction, Position } from '@/types/game';

describe('getOppositeDirection', () => {
  it('should return DOWN for UP', () => {
    expect(getOppositeDirection('UP')).toBe('DOWN');
  });

  it('should return UP for DOWN', () => {
    expect(getOppositeDirection('DOWN')).toBe('UP');
  });

  it('should return RIGHT for LEFT', () => {
    expect(getOppositeDirection('LEFT')).toBe('RIGHT');
  });

  it('should return LEFT for RIGHT', () => {
    expect(getOppositeDirection('RIGHT')).toBe('LEFT');
  });
});

describe('isValidDirectionChange', () => {
  it('should allow perpendicular direction changes', () => {
    expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
    expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'UP')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true);
  });

  it('should not allow opposite direction changes', () => {
    expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
    expect(isValidDirectionChange('DOWN', 'UP')).toBe(false);
    expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
    expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false);
  });

  it('should allow same direction', () => {
    expect(isValidDirectionChange('UP', 'UP')).toBe(true);
    expect(isValidDirectionChange('DOWN', 'DOWN')).toBe(true);
  });
});

describe('generateFood', () => {
  it('should generate food within grid bounds', () => {
    const snake: Position[] = [{ x: 10, y: 10 }];
    const food = generateFood(snake);
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(GRID_SIZE);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(GRID_SIZE);
  });

  it('should not generate food on snake position', () => {
    const snake: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    for (let i = 0; i < 100; i++) {
      const food = generateFood(snake);
      const isOnSnake = snake.some(s => s.x === food.x && s.y === food.y);
      expect(isOnSnake).toBe(false);
    }
  });
});

describe('moveSnake', () => {
  const initialSnake: Position[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  it('should move snake UP correctly', () => {
    const { newSnake, hitWall } = moveSnake(initialSnake, 'UP', 'passthrough');
    expect(newSnake[0]).toEqual({ x: 10, y: 9 });
    expect(hitWall).toBe(false);
  });

  it('should move snake DOWN correctly', () => {
    const { newSnake, hitWall } = moveSnake(initialSnake, 'DOWN', 'passthrough');
    expect(newSnake[0]).toEqual({ x: 10, y: 11 });
    expect(hitWall).toBe(false);
  });

  it('should move snake LEFT correctly', () => {
    const { newSnake, hitWall } = moveSnake(initialSnake, 'LEFT', 'passthrough');
    expect(newSnake[0]).toEqual({ x: 9, y: 10 });
    expect(hitWall).toBe(false);
  });

  it('should move snake RIGHT correctly', () => {
    const { newSnake, hitWall } = moveSnake(initialSnake, 'RIGHT', 'passthrough');
    expect(newSnake[0]).toEqual({ x: 11, y: 10 });
    expect(hitWall).toBe(false);
  });

  it('should wrap around in passthrough mode', () => {
    const snakeAtEdge: Position[] = [{ x: 0, y: 0 }];
    
    const { newSnake: leftWrap } = moveSnake(snakeAtEdge, 'LEFT', 'passthrough');
    expect(leftWrap[0].x).toBe(GRID_SIZE - 1);
    
    const { newSnake: upWrap } = moveSnake(snakeAtEdge, 'UP', 'passthrough');
    expect(upWrap[0].y).toBe(GRID_SIZE - 1);
  });

  it('should detect wall collision in walls mode', () => {
    const snakeAtEdge: Position[] = [{ x: 0, y: 0 }];
    
    const { hitWall: leftHit } = moveSnake(snakeAtEdge, 'LEFT', 'walls');
    expect(leftHit).toBe(true);
    
    const { hitWall: upHit } = moveSnake(snakeAtEdge, 'UP', 'walls');
    expect(upHit).toBe(true);
  });

  it('should not hit wall when moving away from edge', () => {
    const snakeAtEdge: Position[] = [{ x: 0, y: 0 }];
    
    const { hitWall: rightHit } = moveSnake(snakeAtEdge, 'RIGHT', 'walls');
    expect(rightHit).toBe(false);
    
    const { hitWall: downHit } = moveSnake(snakeAtEdge, 'DOWN', 'walls');
    expect(downHit).toBe(false);
  });
});

describe('checkSelfCollision', () => {
  it('should return false for no collision', () => {
    const snake: Position[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    expect(checkSelfCollision(snake)).toBe(false);
  });

  it('should return true when head collides with body', () => {
    const snake: Position[] = [
      { x: 9, y: 10 }, // Head at same position as body
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    expect(checkSelfCollision(snake)).toBe(true);
  });
});

describe('checkFoodCollision', () => {
  it('should return true when snake head is on food', () => {
    const snake: Position[] = [{ x: 5, y: 5 }];
    const food: Position = { x: 5, y: 5 };
    expect(checkFoodCollision(snake, food)).toBe(true);
  });

  it('should return false when snake head is not on food', () => {
    const snake: Position[] = [{ x: 5, y: 5 }];
    const food: Position = { x: 10, y: 10 };
    expect(checkFoodCollision(snake, food)).toBe(false);
  });
});

describe('growSnake', () => {
  it('should add one segment to snake', () => {
    const snake: Position[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
    ];
    const grown = growSnake(snake);
    expect(grown.length).toBe(3);
  });

  it('should duplicate the tail segment', () => {
    const snake: Position[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
    ];
    const grown = growSnake(snake);
    expect(grown[2]).toEqual({ x: 9, y: 10 });
  });
});

describe('calculateSpeed', () => {
  it('should return initial speed for score 0', () => {
    expect(calculateSpeed(0)).toBe(INITIAL_SPEED);
  });

  it('should decrease speed as score increases', () => {
    expect(calculateSpeed(100)).toBeLessThan(INITIAL_SPEED);
  });

  it('should not go below minimum speed', () => {
    expect(calculateSpeed(10000)).toBe(MIN_SPEED);
  });
});

describe('createInitialGameState', () => {
  it('should create valid initial state for passthrough mode', () => {
    const state = createInitialGameState('passthrough');
    expect(state.mode).toBe('passthrough');
    expect(state.snake.length).toBe(3);
    expect(state.direction).toBe('RIGHT');
    expect(state.score).toBe(0);
    expect(state.isGameOver).toBe(false);
    expect(state.isPaused).toBe(false);
  });

  it('should create valid initial state for walls mode', () => {
    const state = createInitialGameState('walls');
    expect(state.mode).toBe('walls');
  });
});

describe('gameStep', () => {
  it('should not change state when paused', () => {
    const state = createInitialGameState('passthrough');
    state.isPaused = true;
    const newState = gameStep(state);
    expect(newState).toEqual(state);
  });

  it('should not change state when game over', () => {
    const state = createInitialGameState('passthrough');
    state.isGameOver = true;
    const newState = gameStep(state);
    expect(newState).toEqual(state);
  });

  it('should move snake in current direction', () => {
    const state = createInitialGameState('passthrough');
    const initialHead = { ...state.snake[0] };
    const newState = gameStep(state);
    expect(newState.snake[0].x).toBe(initialHead.x + 1); // Moving RIGHT
  });

  it('should set game over on wall collision in walls mode', () => {
    const state = createInitialGameState('walls');
    state.snake = [{ x: GRID_SIZE - 1, y: 10 }];
    state.direction = 'RIGHT';
    const newState = gameStep(state);
    expect(newState.isGameOver).toBe(true);
  });

  it('should set game over on self collision', () => {
    const state = createInitialGameState('passthrough');
    state.snake = [
      { x: 10, y: 10 },
      { x: 11, y: 10 },
      { x: 11, y: 9 },
      { x: 10, y: 9 },
      { x: 9, y: 9 },
      { x: 9, y: 10 },
    ];
    state.direction = 'LEFT';
    const newState = gameStep(state);
    expect(newState.isGameOver).toBe(true);
  });

  it('should increase score and grow snake on food collision', () => {
    const state = createInitialGameState('passthrough');
    state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
    const initialLength = state.snake.length;
    const newState = gameStep(state);
    expect(newState.score).toBe(10);
    expect(newState.snake.length).toBe(initialLength + 1);
  });
});

describe('handleDirectionChange', () => {
  it('should change direction when valid', () => {
    const state = createInitialGameState('passthrough');
    state.direction = 'RIGHT';
    const newState = handleDirectionChange(state, 'UP');
    expect(newState.direction).toBe('UP');
  });

  it('should not change to opposite direction', () => {
    const state = createInitialGameState('passthrough');
    state.direction = 'RIGHT';
    const newState = handleDirectionChange(state, 'LEFT');
    expect(newState.direction).toBe('RIGHT');
  });
});

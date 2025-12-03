import { Direction, GameMode, GameState, Position } from '@/types/game';

export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const MIN_SPEED = 50;

export const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const getOppositeDirection = (direction: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[direction];
};

export const isValidDirectionChange = (current: Direction, next: Direction): boolean => {
  return next !== getOppositeDirection(current);
};

export const generateFood = (snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

export const moveSnake = (
  snake: Position[],
  direction: Direction,
  mode: GameMode
): { newSnake: Position[]; hitWall: boolean } => {
  const head = { ...snake[0] };
  
  switch (direction) {
    case 'UP':
      head.y -= 1;
      break;
    case 'DOWN':
      head.y += 1;
      break;
    case 'LEFT':
      head.x -= 1;
      break;
    case 'RIGHT':
      head.x += 1;
      break;
  }
  
  // Handle boundaries based on mode
  if (mode === 'passthrough') {
    if (head.x < 0) head.x = GRID_SIZE - 1;
    if (head.x >= GRID_SIZE) head.x = 0;
    if (head.y < 0) head.y = GRID_SIZE - 1;
    if (head.y >= GRID_SIZE) head.y = 0;
    return { newSnake: [head, ...snake.slice(0, -1)], hitWall: false };
  } else {
    // Walls mode
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return { newSnake: snake, hitWall: true };
    }
    return { newSnake: [head, ...snake.slice(0, -1)], hitWall: false };
  }
};

export const checkSelfCollision = (snake: Position[]): boolean => {
  const head = snake[0];
  return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
};

export const checkFoodCollision = (snake: Position[], food: Position): boolean => {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
};

export const growSnake = (snake: Position[]): Position[] => {
  const tail = snake[snake.length - 1];
  return [...snake, { ...tail }];
};

export const calculateSpeed = (score: number): number => {
  const speedReduction = Math.floor(score / 50) * SPEED_INCREMENT;
  return Math.max(MIN_SPEED, INITIAL_SPEED - speedReduction);
};

export const createInitialGameState = (mode: GameMode): GameState => ({
  snake: [...INITIAL_SNAKE],
  food: generateFood(INITIAL_SNAKE),
  direction: 'RIGHT',
  score: 0,
  isGameOver: false,
  isPaused: false,
  mode,
  speed: INITIAL_SPEED,
});

export const gameStep = (state: GameState): GameState => {
  if (state.isGameOver || state.isPaused) {
    return state;
  }
  
  const { newSnake, hitWall } = moveSnake(state.snake, state.direction, state.mode);
  
  if (hitWall) {
    return { ...state, isGameOver: true };
  }
  
  if (checkSelfCollision(newSnake)) {
    return { ...state, isGameOver: true };
  }
  
  if (checkFoodCollision(newSnake, state.food)) {
    const grownSnake = growSnake(newSnake);
    const newScore = state.score + 10;
    return {
      ...state,
      snake: grownSnake,
      food: generateFood(grownSnake),
      score: newScore,
      speed: calculateSpeed(newScore),
    };
  }
  
  return { ...state, snake: newSnake };
};

export const handleDirectionChange = (state: GameState, newDirection: Direction): GameState => {
  if (!isValidDirectionChange(state.direction, newDirection)) {
    return state;
  }
  return { ...state, direction: newDirection };
};

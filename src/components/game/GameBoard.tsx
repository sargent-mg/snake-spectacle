import React from 'react';
import { Position } from '@/types/game';
import { GRID_SIZE, CELL_SIZE } from '@/lib/gameLogic';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  isSpectator?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ snake, food, isSpectator = false }) => {
  const boardSize = GRID_SIZE * CELL_SIZE;

  return (
    <div 
      className={`relative game-grid-bg arcade-border ${isSpectator ? 'opacity-90' : ''}`}
      style={{ 
        width: boardSize, 
        height: boardSize,
        backgroundColor: 'hsl(var(--game-grid))',
      }}
    >
      {/* Food */}
      <div
        className="absolute rounded-full glow-pink animate-pulse-glow"
        style={{
          left: food.x * CELL_SIZE,
          top: food.y * CELL_SIZE,
          width: CELL_SIZE - 2,
          height: CELL_SIZE - 2,
          backgroundColor: 'hsl(var(--food))',
        }}
      />
      
      {/* Snake */}
      {snake.map((segment, index) => (
        <div
          key={index}
          className={`absolute rounded-sm transition-all duration-75 ${
            index === 0 ? 'glow-green' : ''
          }`}
          style={{
            left: segment.x * CELL_SIZE,
            top: segment.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            backgroundColor: index === 0 
              ? 'hsl(var(--snake-head))' 
              : 'hsl(var(--snake-body))',
            opacity: 1 - (index * 0.02),
          }}
        />
      ))}
    </div>
  );
};

export default GameBoard;

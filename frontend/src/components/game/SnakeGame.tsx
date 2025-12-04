import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, GameState, Direction } from '@/types/game';
import { 
  createInitialGameState, 
  gameStep, 
  handleDirectionChange,
  GRID_SIZE,
  CELL_SIZE 
} from '@/lib/gameLogic';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import GameOverOverlay from './GameOverOverlay';
import api from '@/services/api';

const SnakeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialGameState('passthrough')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const lastDirectionRef = useRef<Direction>(gameState.direction);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.isGameOver) return;

    let newDirection: Direction | null = null;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        newDirection = 'UP';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newDirection = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newDirection = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newDirection = 'RIGHT';
        break;
      case ' ':
        e.preventDefault();
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
        return;
    }

    if (newDirection && newDirection !== lastDirectionRef.current) {
      setGameState(prev => {
        const updated = handleDirectionChange(prev, newDirection!);
        if (updated.direction !== prev.direction) {
          lastDirectionRef.current = updated.direction;
        }
        return updated;
      });
    }
  }, [gameState.isGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    let lastTime = 0;
    const loop = (time: number) => {
      if (time - lastTime >= gameState.speed) {
        setGameState(prev => gameStep(prev));
        lastTime = time;
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.isPaused, gameState.speed]);

  const handleModeChange = (mode: GameMode) => {
    setGameState(createInitialGameState(mode));
    setScoreSubmitted(false);
    lastDirectionRef.current = 'RIGHT';
  };

  const handleRestart = () => {
    setGameState(createInitialGameState(gameState.mode));
    setScoreSubmitted(false);
    lastDirectionRef.current = 'RIGHT';
  };

  const handlePauseToggle = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleSubmitScore = async () => {
    setIsSubmitting(true);
    try {
      await api.submitScore(gameState.score, gameState.mode);
      setScoreSubmitted(true);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
    setIsSubmitting(false);
  };

  const boardSize = GRID_SIZE * CELL_SIZE;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4">
      <div className="relative" style={{ width: boardSize, height: boardSize }}>
        <GameBoard snake={gameState.snake} food={gameState.food} />
        
        {gameState.isPaused && !gameState.isGameOver && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <p className="text-xl text-secondary text-glow-cyan animate-blink">
              PAUSED
            </p>
          </div>
        )}
        
        {gameState.isGameOver && (
          <GameOverOverlay
            score={gameState.score}
            onRestart={handleRestart}
            onSubmitScore={handleSubmitScore}
            isSubmitting={isSubmitting}
            scoreSubmitted={scoreSubmitted}
          />
        )}
      </div>

      <GameControls
        mode={gameState.mode}
        onModeChange={handleModeChange}
        isPaused={gameState.isPaused}
        isGameOver={gameState.isGameOver}
        onPauseToggle={handlePauseToggle}
        onRestart={handleRestart}
        score={gameState.score}
      />
    </div>
  );
};

export default SnakeGame;

import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/types/game';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface GameControlsProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  isPaused: boolean;
  isGameOver: boolean;
  onPauseToggle: () => void;
  onRestart: () => void;
  score: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  mode,
  onModeChange,
  isPaused,
  isGameOver,
  onPauseToggle,
  onRestart,
  score,
}) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Score Display */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">SCORE</p>
        <p className="text-2xl text-primary text-glow-green">{score}</p>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground text-center">MODE</p>
        <div className="flex gap-2">
          <Button
            variant={mode === 'passthrough' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('passthrough')}
            className={`text-[10px] ${mode === 'passthrough' ? 'glow-green' : ''}`}
          >
            PASS
          </Button>
          <Button
            variant={mode === 'walls' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('walls')}
            className={`text-[10px] ${mode === 'walls' ? 'glow-green' : ''}`}
          >
            WALLS
          </Button>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-2">
        {!isGameOver && (
          <Button
            variant="outline"
            size="icon"
            onClick={onPauseToggle}
            className="glow-cyan"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={onRestart}
          className="glow-pink"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-[8px] text-muted-foreground text-center mt-4 space-y-1">
        <p>↑ ↓ ← → or WASD</p>
        <p>SPACE to pause</p>
      </div>
    </div>
  );
};

export default GameControls;

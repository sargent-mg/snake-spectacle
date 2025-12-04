import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface GameOverOverlayProps {
  score: number;
  onRestart: () => void;
  onSubmitScore: () => void;
  isSubmitting: boolean;
  scoreSubmitted: boolean;
}

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  onRestart,
  onSubmitScore,
  isSubmitting,
  scoreSubmitted,
}) => {
  const { user } = useAuth();

  return (
    <div className="absolute inset-0 bg-background/90 flex items-center justify-center animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-xl text-accent text-glow-pink animate-pulse-glow">
          GAME OVER
        </h2>
        <p className="text-lg text-primary text-glow-green">
          SCORE: {score}
        </p>
        
        <div className="flex flex-col gap-2 mt-6">
          <Button onClick={onRestart} className="glow-green">
            PLAY AGAIN
          </Button>
          
          {user ? (
            <Button
              variant="outline"
              onClick={onSubmitScore}
              disabled={isSubmitting || scoreSubmitted}
              className={scoreSubmitted ? 'glow-cyan' : ''}
            >
              {scoreSubmitted ? 'SUBMITTED!' : isSubmitting ? 'SAVING...' : 'SUBMIT SCORE'}
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" className="w-full">
                LOGIN TO SAVE
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOverOverlay;

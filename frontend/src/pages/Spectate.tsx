import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import GameBoard from '@/components/game/GameBoard';
import { ActivePlayer } from '@/types/game';
import api from '@/services/api';
import { GRID_SIZE } from '@/lib/gameLogic';
import { Eye, Users, Clock } from 'lucide-react';

const Spectate: React.FC = () => {
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const animationRef = useRef<number | null>(null);

  // Fetch active players
  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      const response = await api.getActivePlayers();
      if (response.success && response.data) {
        setActivePlayers(response.data);
        if (response.data.length > 0 && !selectedPlayer) {
          setSelectedPlayer(response.data[0]);
        }
      }
      setIsLoading(false);
    };
    fetchPlayers();
    
    // Refresh player list every 10 seconds
    const interval = setInterval(fetchPlayers, 10000);
    return () => clearInterval(interval);
  }, []);

  // Simulate player movement when watching
  useEffect(() => {
    if (!selectedPlayer) return;

    let lastTime = 0;
    const speed = 200;

    const animate = (time: number) => {
      if (time - lastTime >= speed) {
        setSelectedPlayer(prev => {
          if (!prev) return null;
          return api.simulatePlayerMove(prev, GRID_SIZE);
        });
        lastTime = time;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedPlayer?.id]);

  const getPlayTime = (startedAt: string) => {
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    const minutes = Math.floor((now - start) / 60000);
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          <h1 className="text-xl text-center text-primary text-glow-green mb-6">
            👁️ SPECTATE
          </h1>

          <div className="grid lg:grid-cols-[300px_1fr] gap-6 max-w-4xl mx-auto">
            {/* Player List */}
            <div className="arcade-border bg-card rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-secondary" />
                <h2 className="text-sm text-secondary">LIVE PLAYERS</h2>
              </div>

              {isLoading ? (
                <p className="text-[10px] text-muted-foreground animate-pulse">
                  LOADING...
                </p>
              ) : activePlayers.length === 0 ? (
                <p className="text-[10px] text-muted-foreground">
                  NO ACTIVE PLAYERS
                </p>
              ) : (
                <div className="space-y-2">
                  {activePlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className={`w-full p-3 rounded text-left transition-all ${
                        selectedPlayer?.id === player.id
                          ? 'bg-primary/20 border border-primary glow-green'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-foreground">
                          {player.username}
                        </span>
                        <span className="text-[10px] text-primary">
                          {player.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] text-muted-foreground">
                          {player.mode.toUpperCase()}
                        </span>
                        <span className="text-[8px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2 w-2" />
                          {getPlayTime(player.startedAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Game View */}
            <div className="flex flex-col items-center">
              {selectedPlayer ? (
                <>
                  <div className="mb-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-accent animate-pulse" />
                      <span className="text-sm text-accent">WATCHING</span>
                    </div>
                    <p className="text-lg text-secondary text-glow-cyan">
                      {selectedPlayer.username}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {selectedPlayer.mode.toUpperCase()} MODE
                    </p>
                  </div>

                  <div className="relative">
                    <GameBoard
                      snake={selectedPlayer.snake}
                      food={selectedPlayer.food}
                      isSpectator
                    />
                    <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 rounded">
                      <p className="text-xs text-primary">{selectedPlayer.score}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="arcade-border bg-card rounded-lg p-8 text-center">
                  <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    SELECT A PLAYER TO WATCH
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Spectate;

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { LeaderboardEntry, GameMode } from '@/types/game';
import api from '@/services/api';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterMode, setFilterMode] = useState<GameMode | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const response = await api.getLeaderboard(
        filterMode === 'all' ? undefined : filterMode
      );
      if (response.success && response.data) {
        setEntries(response.data);
      }
      setIsLoading(false);
    };
    fetchLeaderboard();
  }, [filterMode]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-neon-yellow" />;
      case 1:
        return <Medal className="h-4 w-4 text-muted-foreground" />;
      case 2:
        return <Award className="h-4 w-4 text-neon-pink" />;
      default:
        return <span className="text-[10px] text-muted-foreground w-4">{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-fade-in">
          <h1 className="text-xl text-center text-primary text-glow-green mb-6">
            🏆 LEADERBOARD
          </h1>

          {/* Filter */}
          <div className="flex justify-center gap-2 mb-6">
            {(['all', 'passthrough', 'walls'] as const).map((mode) => (
              <Button
                key={mode}
                variant={filterMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMode(mode)}
                className={`text-[10px] ${filterMode === mode ? 'glow-green' : ''}`}
              >
                {mode.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="arcade-border bg-card rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground animate-pulse">LOADING...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">NO SCORES YET</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                      index < 3 ? 'bg-muted/20' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-6 flex justify-center">
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <p className={`text-sm ${
                          index === 0 ? 'text-neon-yellow' : 
                          index === 1 ? 'text-foreground' : 
                          index === 2 ? 'text-neon-pink' : 'text-foreground'
                        }`}>
                          {entry.username}
                        </p>
                        <p className="text-[8px] text-muted-foreground">
                          {entry.mode.toUpperCase()} • {entry.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg ${
                        index === 0 ? 'text-glow-green text-primary' : 'text-secondary'
                      }`}>
                        {entry.score}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;

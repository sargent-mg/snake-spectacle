import React from 'react';
import Header from '@/components/layout/Header';
import SnakeGame from '@/components/game/SnakeGame';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="animate-fade-in">
          <SnakeGame />
        </div>
      </main>
    </div>
  );
};

export default Index;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { toast } from '@/hooks/use-toast';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        if (username.length < 3) {
          toast({
            title: 'Error',
            description: 'Username must be at least 3 characters',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        result = await signup(email, username, password);
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: isLogin ? 'Welcome back!' : 'Account created!',
        });
        navigate('/');
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="arcade-border bg-card p-6 rounded-lg">
            <h1 className="text-xl text-center text-primary text-glow-green mb-6">
              {isLogin ? 'LOGIN' : 'SIGN UP'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] text-muted-foreground">
                  EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                  placeholder="player@snake.game"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[10px] text-muted-foreground">
                    USERNAME
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                    className="bg-input border-border text-foreground"
                    placeholder="SnakeMaster"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] text-muted-foreground">
                  PASSWORD
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-input border-border text-foreground"
                  placeholder="••••••"
                />
              </div>

              <Button
                type="submit"
                className="w-full glow-green"
                disabled={isLoading}
              >
                {isLoading ? 'LOADING...' : isLogin ? 'ENTER' : 'CREATE'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] text-muted-foreground hover:text-secondary transition-colors"
              >
                {isLogin ? 'Need an account? SIGN UP' : 'Have an account? LOGIN'}
              </button>
            </div>

            {isLogin && (
              <div className="mt-4 p-3 bg-muted rounded text-[8px] text-muted-foreground">
                <p className="mb-1">DEMO ACCOUNT:</p>
                <p>Email: demo@snake.game</p>
                <p>Password: demo123</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || null
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) {
          throw signInError;
        }
      }

      onAuthenticated();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-5">
        <div className="space-y-2 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold">Momentum</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login' ? 'Sign in to your workspace' : 'Create your workspace account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-label="Name"
            />
          )}

          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            aria-label="Email"
          />

          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            minLength={6}
            aria-label="Password"
          />

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <button
          type="button"
          className="w-full text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
        >
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
      </Card>
    </div>
  );
};

export default AuthScreen;

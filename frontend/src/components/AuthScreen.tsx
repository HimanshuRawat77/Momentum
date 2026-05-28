import React, { useEffect, useState } from 'react';
import BrandLogo from './BrandLogo';
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
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading || cooldownSeconds > 0) return;
    setError('');
    setInfo('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
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

        // Keep signup simple and explicit for users.
        if (data.session) {
          onAuthenticated();
        } else {
          setInfo('Account created. If email confirmation is enabled, please verify your inbox, then sign in.');
          setMode('login');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) {
          throw signInError;
        }
        onAuthenticated();
      }
    } catch (err: any) {
      const message = String(err?.message || 'Authentication failed');
      const isRateLimited = message.toLowerCase().includes('too many requests') || String(err?.status) === '429';
      const isInvalidCreds = message.toLowerCase().includes('invalid login credentials');
      const isEmailNotConfirmed = message.toLowerCase().includes('email not confirmed');

      if (isRateLimited) {
        setCooldownSeconds(30);
        setError('Too many attempts. Please wait 30 seconds, then try again.');
      } else if (isEmailNotConfirmed) {
        setError('Email not confirmed. Please verify your inbox, then sign in.');
      } else if (isInvalidCreds) {
        setError('Invalid email/password. If you have not created an account yet, use Sign Up first.');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-5">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <BrandLogo className="scale-[0.72] origin-center -my-3" />
          </div>
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
          {info && <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p>}

          <Button type="submit" className="w-full" disabled={isLoading || cooldownSeconds > 0}>
            {isLoading
              ? 'Please wait...'
              : cooldownSeconds > 0
                ? `Try again in ${cooldownSeconds}s`
                : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
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

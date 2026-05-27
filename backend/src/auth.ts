import { NextFunction, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Auth] SUPABASE_URL or SUPABASE_ANON_KEY is missing. Auth routes will reject requests.');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server auth is not configured' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.userId = data.user.id;
  return next();
}

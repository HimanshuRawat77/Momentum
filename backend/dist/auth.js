"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Auth] SUPABASE_URL or SUPABASE_ANON_KEY is missing. Auth routes will reject requests.');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl || '', supabaseAnonKey || '');
async function requireAuth(req, res, next) {
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

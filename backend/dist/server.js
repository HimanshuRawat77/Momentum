"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const stats_1 = __importDefault(require("./routes/stats"));
const auth_1 = require("./auth");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
const explicitOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        // Allow non-browser tools and server-side clients without Origin header.
        if (!origin) {
            return callback(null, true);
        }
        const isExplicitOrigin = explicitOrigins.includes(origin);
        const isLocalDevOrigin = localhostOriginPattern.test(origin);
        if (isExplicitOrigin || isLocalDevOrigin) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
};
// Middlewares
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Logging middleware
app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
});
// Register routes
app.use('/api/tasks', auth_1.requireAuth, tasks_1.default);
app.use('/api/stats', auth_1.requireAuth, stats_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('[Global Error]', err);
    if (err?.message?.startsWith('CORS blocked for origin:')) {
        return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
// Start listening
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Momentum API Server running on port ${PORT}`);
    console.log(`CORS local dev origins: localhost / 127.0.0.1 (any port)`);
    if (explicitOrigins.length > 0) {
        console.log(`CORS explicit origins: ${explicitOrigins.join(', ')}`);
    }
    console.log(`=========================================`);
});

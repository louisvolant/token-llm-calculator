// backend/server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const csrf = require('csurf');
const mongoose = require('./config/mongoose');

const app = express();
app.set('trust proxy', 1);

const apicache = require('apicache');
const apiRoutes = require('./routes/api');

const cache = apicache.middleware('1 minute', (req, res) => req.method === 'GET');

app.use(express.json({ limit: '50mb' })); // Limit of what can be sent

const allowedOrigins = [
  process.env.CORS_DEV_FRONTEND_URL_AND_PORT,
  'https://tokenizors.net',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

const MONGO_URI = `mongodb+srv://${process.env.MONGODB_ATLAS_USERNAME}:${process.env.MONGODB_ATLAS_PASSWORD}@${process.env.MONGODB_ATLAS_CLUSTER_URL}/${process.env.MONGODB_ATLAS_DB_NAME}?retryWrites=true&w=majority&appName=${process.env.MONGODB_ATLAS_APP_NAME}`;

app.use(session({
  name: 'session',
  secret: process.env.SESSION_COOKIE_KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60,
    autoRemove: 'native',
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'PRODUCTION',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Apply CSRF middleware globally
const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);

// Middleware to log session details
app.use((req, res, next) => {
  console.log('Session config:', {
    secure: process.env.NODE_ENV === 'PRODUCTION',
    sessionId: req.sessionID,
    user: req.session.user,
  });
  next();
});

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API routes with caching for GET requests
app.use('/api', cache, apiRoutes);

// Error handling for CSRF token validation failures
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.log(`CSRF validation failed for ${req.method} ${req.url}`);
    res.status(403).json({ error: 'Invalid CSRF token' });
  } else {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
    next(err);
  }
});

const PORT = process.env.PORT || 3001;

mongoose.connection.once('open', () => {
  console.log('MongoDB connected successfully');
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
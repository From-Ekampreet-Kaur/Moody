require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Connection event listeners
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware - Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false
});

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter: 24 * 3600 // lazy session update (seconds)
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        sameSite: 'lax'
    }
}));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
// Serve `public` at root (e.g. /assets/...) and also at /public/... so existing links work
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Load user middleware - makes user available in all views
const { loadUser, requireLogin, requireGuest } = require('./middleware/auth');
app.use(loadUser);

// Import routes
const authRoutes = require('./routes/authRoutes');
const moodRoutes = require('./routes/moodRoutes');
const cravingRoutes = require('./routes/cravingRoutes');
const profileRoutes = require('./routes/profileRoutes');
const periodRoutes = require('./routes/periodRoutes');

/* ---------------------------
            ROUTES
---------------------------- */

// Mount API routes with rate limiting
app.use('/auth', authLimiter, authRoutes);
app.use('/api/moods', apiLimiter, moodRoutes);
app.use('/api/cravings', apiLimiter, cravingRoutes);
app.use('/api/profile', apiLimiter, profileRoutes);
app.use('/api/periods', apiLimiter, periodRoutes);

// Landing Page - show landing if not logged in, redirect to dashboard if logged in
app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('components/landing', { title: 'Moody' });
});

// About Page
app.get('/about', (req, res) => {
    res.render('components/about', { title: 'About - Moody' });
});

// Dashboard - protected route
app.get('/dashboard', requireLogin, (req, res) => {
    res.render('dashboard', { title: 'Dashboard - Moody' });
});

// Auth routes (support both /login and /auth/login, /signup and /auth/signup)
app.get(['/login', '/auth/login'], requireGuest, (req, res) => {
    res.render('auth/login', { title: 'Login - Moody', errors: null, email: '' });
});

app.get(['/signup', '/auth/signup'], requireGuest, (req, res) => {
    res.render('auth/signup', { title: 'Signup - Moody', errors: null, formData: {} });
});

// Simple forgot-password placeholder
app.get('/forgot', (req, res) => {
    // no dedicated view yet — redirect to login for now
    res.redirect('/login');
});

// Profile and features - all protected
app.get('/profile', requireLogin, (req, res) => {
    res.render('components/profile', { title: 'Profile - Moody' });
});

app.get(['/cravings', '/craving.html', '/craving'], requireLogin, (req, res) => {
    res.render('components/cravings', { title: 'Cravings - Moody' });
});

// Moods page — user inputs mood and receives affirmations
app.get(['/moods', '/mood'], requireLogin, (req, res) => {
    res.render('components/moods', { title: 'How are you feeling? - Moody' });
});

// Mood history page
app.get(['/mood/history', '/moods/history'], requireLogin, (req, res) => {
    res.render('mood/history', { title: 'Mood History - Moody' });
});

// Period Tracker/Prediction page
app.get(['/prediction', '/period-tracker', '/tracker'], requireLogin, (req, res) => {
    res.render('components/prediction', { title: 'Period Tracker - Moody' });
});

// Period History page
app.get(['/period/history', '/periods/history'], requireLogin, (req, res) => {
    res.render('period/history', { title: 'Period History - Moody' });
});

// Explicit render routes for each template (convenience/developer routes)
app.get(['/landing', '/components/landing'], (req, res) => {
    res.render('components/landing', { title: 'Moody' });
});

app.get(['/components/cravings', '/components/craving'], (req, res) => {
    res.render('components/cravings', { title: 'Cravings - Moody' });
});

app.get(['/components/profile', '/profile.html'], (req, res) => {
    res.render('components/profile', { title: 'Profile - Moody' });
});

app.get(['/components/moods', '/moods.html'], (req, res) => {
    res.render('components/moods', { title: 'How are you feeling? - Moody' });
});

// Auth convenience routes
app.get('/auth', (req, res) => res.redirect('/login'));

// Logout route
app.get('/logout', requireLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Legacy POST handlers - redirect to new auth routes
app.post('/login', (req, res) => {
    // Redirect POST to auth route handler
    authRoutes.handle(req, res);
});

app.post('/signup', (req, res) => {
    // Redirect POST to auth route handler
    authRoutes.handle(req, res);
});

// Error handling middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Moody server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

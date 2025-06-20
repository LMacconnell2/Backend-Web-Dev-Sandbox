import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDatabase, testConnection } from './src/models/setup.js';
import dashboardRoutes from './src/routes/dashboard/index.js';
import db from './src/models/db.js';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import accountRoutes from './src/routes/accounts/index.js';
import flashMessages from './src/middleware/flash.js';

import testRoutes from './src/routes/test.js';
 
// Import route handlers from their new locations
import indexRoutes from './src/routes/index.js';
import productRoutes from './src/routes/product/index.js';
 
// Import global middleware
import { addGlobalData } from './src/middleware/index.js';
 
/**
 * Define important variables
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;
 
/**
 * Create an instance of an Express application
 */
const app = express();
 
/**
 * Configure the Express server
 */
 
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
 
// Set the view engine to EJS
app.set('view engine', 'ejs');
 
// Set the views directory (where your templates are located)
app.set('views', path.join(__dirname, 'src/views'));

// Middleware to parse JSON data in request body
app.use(express.json());
 
// Middleware to parse URL-encoded form data (like from a standard HTML form)
app.use(express.urlencoded({ extended: true }));
 
/**
 * Middleware
 */
app.use(addGlobalData);

app.use(express.json());

app.use(express.urlencoded({extended: true}));

// Add flash message middleware (after session, before routes)
app.use(flashMessages);

// Configure PostgreSQL session store
const PostgresStore = pgSession(session);
 
// Configure session middleware
app.use(session({
    store: new PostgresStore({
        pool: db, // Use your PostgreSQL connection
        tableName: 'sessions', // Table name for storing sessions
        createTableIfMissing: true // Creates table if it does not exist
    }),
    secret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true, // Prevents client-side access to the cookie
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    }
}));

app.use('/dashboard', dashboardRoutes);
 
/**
 * Routes
 */
app.use('/', indexRoutes);
app.use('/product', productRoutes);
app.use('/test', testRoutes);
app.use('/accounts', accountRoutes);

// 404 Error Handler
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err); // Forward to the global error handler
});
 
// Global Error Handler
app.use((err, req, res, next) => {
    // Log the error for debugging
    console.error(err.stack);
 
    // Set default status and determine error type
    const status = err.status || 500;
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Internal Server Error',
        error: err.message,
        stack: err.stack
    };
 
    // Render the appropriate template based on status code
    res.status(status).render(`errors/${status === 404 ? '404' : '500'}`, context);
});
 
/**
 * Start the server
 */
 
// When in development mode, start a WebSocket server for live reloading
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');
 
    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });
 
        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });
 
        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}
 
// Start the Express server on the specified port
app.listen(PORT, async () => {
    try {
        await testConnection();
        await setupDatabase();
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
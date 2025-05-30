// Middleware to add global data to res.locals
export const addGlobalData = (req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    res.locals.NODE_ENV = process.env.NODE_ENV || 'development';
    next();
};
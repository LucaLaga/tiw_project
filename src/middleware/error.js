import logger from '../utils/logger.js';

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${err.stack}`);

    res.status(statusCode).render('errors/500', {
        message: statusCode === 500 ? 'Si è verificato un errore interno del server' : message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
}

export default errorHandler;

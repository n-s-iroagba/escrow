import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'debug.log');

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const { method, url, body, query, params, headers } = req;

    // Filter sensitive data
    const safeBody = { ...body };
    if (safeBody.password) safeBody.password = '***';
    if (safeBody.confirmPassword) safeBody.confirmPassword = '***';

    const logEntry = `
[${timestamp}] REQUEST: ${method} ${url}
Headers: ${JSON.stringify(headers)}
Query: ${JSON.stringify(query)}
Params: ${JSON.stringify(params)}
Body: ${JSON.stringify(safeBody)}
----------------------------------------
`;

    // Append to file asynchronously
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });

    next();
};

export const logErrorToFile = (error: any, req: Request) => {
    const timestamp = new Date().toISOString();
    const { method, url } = req;

    const errorLog = `
[${timestamp}] ERROR in ${method} ${url}
Message: ${error.message}
Stack: ${error.stack}
----------------------------------------
`;

    fs.appendFile(logFile, errorLog, (err) => {
        if (err) console.error('Failed to write error to log file:', err);
    });
};

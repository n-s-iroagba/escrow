// @ts-ignore
import moduleAlias from 'module-alias';
import path from 'path';

// Register aliases dynamically to support both src (dev) and dist (prod) without package.json duplication
moduleAlias.addAliases({
  '@': __dirname,
  '@config': path.join(__dirname, 'config'),
  '@models': path.join(__dirname, 'models'),
  '@repositories': path.join(__dirname, 'repositories'),
  '@services': path.join(__dirname, 'services'),
  '@controllers': path.join(__dirname, 'controllers'),
  '@middlewares': path.join(__dirname, 'middlewares'),
  '@utils': path.join(__dirname, 'utils'),
  '@helpers': path.join(__dirname, 'helpers'),
  '@validators': path.join(__dirname, 'validators'),
  '@types': path.join(__dirname, 'types')
});

import App from './app';
import logger from './config/logger';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
  process.exit(1);
});

// Initialize and start the server
const app = new App();

const server = app.listen();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { reason, promise });
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('💤 Process terminated!');
  });
});

export default app;
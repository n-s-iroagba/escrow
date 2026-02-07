import express, { Application, Request, Response } from 'express';
import cors from 'cors';

import env from './config/env';
import logger from './config/logger';

import { verifyEmailConnection } from './config/mailer';
import { errorHandler } from './utils/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import escrowRoutes from './routers/escrowRoutes';
import kycRoutes from './routers/kycRoutes';
import bankRoutes from './routers/bankRoutes';
import custodialWalletRoutes from './routers/custodialWalletRoutes';
import userRoutes from './routers/userRoutes';
import authRoutes from './routers/authRoutes';
import sellerBankAccountRoutes from './routers/sellerBankAccountRoutes';
// import { seed } from './scripts/seed';
// import { testConnection } from './config/database';




class App {

  public app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.app.set('trust proxy', 1); // Enable trust proxy for load balancers/reverse proxies
    this.port = parseInt(env.PORT);

    this.initializeMiddlewares();
    this.initializeDatabase();
    this.initializeEmail();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware


    // CORS configuration
    this.app.use(cors({
      origin: 'https://muskxsecureescrow.vercel.app',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Request logging
    this.app.use(requestLogger);

    // Rate limiting




    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parsing
    const cookieParser = require('cookie-parser');
    this.app.use(cookieParser());

  }

  private async initializeDatabase(): Promise<void> {
    try {
      // await User.sync({ force: true }); // Removed to prevent dropping table with FK constraints

      // await testConnection();
      // await seed()

      logger.info('✅ Database initialized');
    } catch (error) {
      logger.error('❌ Database initialization failed:', error);
      process.exit(1);
    }
  }

  private async initializeEmail(): Promise<void> {
    await verifyEmailConnection();
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Escrow Platform API',
        version: env.API_VERSION,
        environment: env.NODE_ENV,
      });
    });

    // API routes will be added here
    this.app.use(`/api/v1'`, (_req: Request, _res: Response, next) => {
      // API routes will be mounted here
      next();
    });

    this.app.use(`/api/v1/escrow`, escrowRoutes);
    this.app.use(`/api/v1/kyc`, kycRoutes);
    this.app.use(`/api/v1/banks`, bankRoutes);
    this.app.use(`/api/v1/custodial-wallets`, custodialWalletRoutes);
    this.app.use(`/api/v1/auth`, authRoutes);
    this.app.use(`/api/v1/users`, userRoutes);
    this.app.use(`/api/v1/seller-banks`, sellerBankAccountRoutes);
    this.app.use(`/api/v1/buyer-wallets`, require('./routers/buyerCryptoWalletRoutes').default);
    this.app.use(`/api/v1/seller-wallets`, require('./routers/sellerCryptoWalletRoutes').default);


    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public listen() {
    return this.app.listen(this.port, () => {
      logger.info(`
      🚀 Server started successfully!
      📍 Environment: ${env.NODE_ENV}
      🌐 URL: http://localhost:${this.port}
      📊 API Version: ${env.API_VERSION}
      ⏰ Time: ${new Date().toISOString()}
      `);
    });
  }

  public getServer(): Application {
    return this.app;
  }
}

export default App;
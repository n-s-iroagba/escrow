import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import env from './env';



// Database configuration
const dbConfig: SequelizeOptions = {
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT),
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  dialect: 'mysql',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  // models: [path.join(__dirname, '../models')],
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  timezone: '+00:00', // UTC
};

// Create Sequelize instance
let sequelize: Sequelize;

if (env.DATABASE_URL) {
  // Use connection string (Production/Fly.io)
  sequelize = new Sequelize(env.DATABASE_URL, {
    dialect: 'mysql',
    logging: env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    timezone: '+00:00',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Use individual params (Development/Local)
  sequelize = new Sequelize(dbConfig);
}

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();


    // await sequelize.sync({
    //   force: true
    // });
    // console.log('✅ Database synchronized');

    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;
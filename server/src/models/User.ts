import { Model, DataTypes, } from 'sequelize';
import { UserRole, KycStatus } from '../utils/constants';
import sequelize from '@/config/database';

export interface IUser {
  id: string;
  email: string;
  password: string;
  role: string;
  emailVerified: boolean;
  kycStatus?: string;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class User extends Model<IUser> implements IUser {
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: string;
  public emailVerified!: boolean;
  public kycStatus?: string;
  public emailVerificationToken?: string;
  public emailVerificationTokenExpires?: Date;
  public passwordResetToken?: string;
  public passwordResetTokenExpires?: Date;
  public lastLoginAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Exclude password from JSON
  toJSON() {
    const values = { ...this.get() };

    delete values.emailVerificationToken;
    delete values.passwordResetToken;
    return values;
  }
}


User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.CLIENT,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'email_verified',
    },
    kycStatus: {
      type: DataTypes.ENUM(...Object.values(KycStatus)),
      allowNull: true,
      field: 'kyc_status',
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'email_verification_token',
    },
    emailVerificationTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_verification_token_expires',
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'password_reset_token',
    },
    passwordResetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_reset_token_expires',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },

    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        // Hash password before creating user
        const bcrypt = await import('bcrypt');
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user: User) => {
        // Hash password if it's being updated
        const bcrypt = await import('bcrypt');
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);


export default User;
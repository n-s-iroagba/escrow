import sequelize from '@/config/database';
import { Model, DataTypes } from 'sequelize';


export interface ISellerBankAccount {
  id: string;
  sellerId: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  routingNumber?: string;
  iban?: string;
  swift?: string;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class SellerBankAccount extends Model<ISellerBankAccount> implements ISellerBankAccount {
  declare public id: string;
  declare public sellerId: string;
  declare public bankName: string;
  declare public accountNumber: string;
  declare public accountHolderName: string;
  declare public routingNumber?: string;
  declare public iban?: string;
  declare public swift?: string;
  declare public isPrimary: boolean;
  declare public isVerified: boolean;
  declare public verifiedAt?: Date;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

}
SellerBankAccount.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sellerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'seller_id',
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'bank_name',
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'account_number',
    },
    accountHolderName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'account_holder_name',
    },
    routingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'routing_number',
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    swift: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_primary',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_verified',
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'verified_at',
    },

    updatedAt: { type: DataTypes.DATE },
    createdAt: { type: DataTypes.DATE }
  },
  {
    sequelize,
    tableName: 'seller_bank_accounts',
    timestamps: true,
    indexes: [
      {
        fields: ['seller_id'],
      },

      {
        fields: ['is_primary'],
      },
      {
        fields: ['is_verified'],
      },
    ],
  }
);

export default SellerBankAccount;
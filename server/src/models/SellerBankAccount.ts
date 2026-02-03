import sequelize from '@/config/database';
import { Model, DataTypes } from 'sequelize';


export interface ISellerBankAccount {
  id: string;
  sellerId: string;

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
  public id!: string;
  public sellerId!: string;

  public accountNumber!: string;
  public accountHolderName!: string;
  public routingNumber?: string;
  public iban?: string;
  public swift?: string;
  public isPrimary!: boolean;
  public isVerified!: boolean;
  public verifiedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
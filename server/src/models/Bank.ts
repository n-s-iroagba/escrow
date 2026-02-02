import { Model, DataTypes } from 'sequelize';
import { BankAccountType } from '../utils/constants';
import sequelize from '@/config/database';

export interface IBank {
  id: string;
  name: string;
  accountNumber: string;
  currency: string;
  recipientName?: string;
  logoUrl?: string;
  bankAddress?: string;
  iban?: string;
  swift?: string;
  routingNumber?: string;

  createdAt: Date;
  updatedAt: Date;
}

class Bank extends Model<IBank> implements IBank {
  public id!: string;
  public name!: string;
  public accountNumber!: string;
  public currency!: string;
  public recipientName?: string;
  public logoUrl?: string;
  public bankAddress?: string;
  public iban?: string;
  public swift?: string;
  public routingNumber?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}


Bank.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'account_number',
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'recipient_name',
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'logo_url',
    },
    bankAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'bank_address',
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    swift: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    routingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'routing_number',
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE }
  },
  {
    sequelize,
    tableName: 'banks',
    timestamps: true,
  }
);



export default Bank;
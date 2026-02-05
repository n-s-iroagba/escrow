import { Model, DataTypes } from 'sequelize';
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
  declare public id: string;
  declare public name: string;
  declare public accountNumber: string;
  declare public currency: string;
  declare public recipientName?: string;
  declare public logoUrl?: string;
  declare public bankAddress?: string;
  declare public iban?: string;
  declare public swift?: string;
  declare public routingNumber?: string;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
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
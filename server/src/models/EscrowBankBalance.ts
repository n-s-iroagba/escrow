import sequelize from '@/config/database';
import { DataTypes, Model } from 'sequelize';


export interface IEscrowBankBalance {
  id: string;
  escrowId: string;
  bankId: string;
  amount: number;
  currency: string;
  confirmedByAdmin: boolean;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class EscrowBankBalance extends Model<IEscrowBankBalance> implements IEscrowBankBalance {
  declare public id: string;
  declare public escrowId: string;
  declare public bankId: string;
  declare public amount: number;
  declare public currency: string;
  declare public confirmedByAdmin: boolean;
  declare public confirmedAt?: Date;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}


EscrowBankBalance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    escrowId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'escrow_id',
    },
    bankId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'bank_id',
    },
    amount: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    confirmedByAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'confirmed_by_admin',
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'confirmed_at',
    }, createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE }
  },
  {
    sequelize,
    tableName: 'escrow_bank_balances',
    timestamps: true,
    indexes: [
      {
        fields: ['escrow_id'],
      },
      {
        fields: ['bank_id'],
      },
    ],
  }
);


export default EscrowBankBalance;
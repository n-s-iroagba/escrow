import { Model, DataTypes } from 'sequelize';
import { WalletRole, Currency } from '../utils/constants';
import sequelize from '@/config/database';

export interface IEscrowCryptoWalletBalance {
  id: string;
  escrowId: string;
  walletAddress: string;
  role: string;
  balance: number;
  currency: string;
  confirmedByAdmin: boolean;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class EscrowCryptoWalletBalance extends Model<IEscrowCryptoWalletBalance> implements IEscrowCryptoWalletBalance {
  declare public id: string;
  declare public escrowId: string;
  declare public walletAddress: string;
  declare public role: string;
  declare public balance: number;
  declare public currency: string;
  declare public confirmedByAdmin: boolean;
  declare public confirmedAt?: Date;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}


EscrowCryptoWalletBalance.init(
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
    walletAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'wallet_address',
    },
    role: {
      type: DataTypes.ENUM(...Object.values(WalletRole)),
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.ENUM(...Object.values(Currency).filter(c =>
        ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'XRP'].includes(c)
      )),
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
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE }
  },
  {
    sequelize,
    tableName: 'escrow_crypto_wallet_balances',
    timestamps: true,
    indexes: [
      {
        fields: ['escrow_id'],
      },
      {
        fields: ['wallet_address'],
      },
      {
        fields: ['role'],
      },
    ],
  }
);



export default EscrowCryptoWalletBalance;
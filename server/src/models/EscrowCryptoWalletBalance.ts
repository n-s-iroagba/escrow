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
  public id!: string;
  public escrowId!: string;
  public walletAddress!: string;
  public role!: string;
  public balance!: number;
  public currency!: string;
  public confirmedByAdmin!: boolean;
  public confirmedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
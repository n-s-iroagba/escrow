import { Model, DataTypes } from 'sequelize';
import { Currency } from '../utils/constants';
import sequelize from '@/config/database';

export interface ISellerCryptoWallet {
  id: string;
  sellerId: string;
  currency: string;
  walletAddress: string;

  network: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class SellerCryptoWallet extends Model<ISellerCryptoWallet> implements ISellerCryptoWallet {
  declare public id: string;
  declare public sellerId: string;
  declare public currency: string;
  declare public walletAddress: string;

  declare public network: string;
  declare public verifiedAt?: Date;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  // Static initialization method
}
SellerCryptoWallet.init(
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
    currency: {
      type: DataTypes.ENUM(...Object.values(Currency).filter(c => ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'XRP'].includes(c)
      )),
      allowNull: false,
    },
    walletAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'wallet_address',
    },

    network: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'mainnet',
    },



    updatedAt: { type: DataTypes.DATE },
    createdAt: { type: DataTypes.DATE }
  }, {
  sequelize,
  tableName: 'seller_crypto_wallets',
  timestamps: true,
  indexes: [
    {
      fields: ['seller_id'],
    },
    {
      fields: ['currency'],
    },
    {
      fields: ['wallet_address'],
      unique: true,
    },

  ],
}
);




export default SellerCryptoWallet;
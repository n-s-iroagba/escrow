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
  public id!: string;
  public sellerId!: string;
  public currency!: string;
  public walletAddress!: string;

  public network!: string;
  public verifiedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
      },{
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
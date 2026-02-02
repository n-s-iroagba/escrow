import { Model, DataTypes } from 'sequelize';
import { Currency } from '../utils/constants';
import sequelize from '@/config/database';

export interface IBuyerCryptoWallet {
  id: string;
  buyerId: string;
  currency: string;
  walletAddress: string;
 
  network: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class BuyerCryptoWallet extends Model<IBuyerCryptoWallet> implements IBuyerCryptoWallet {
  public id!: string;
  public buyerId!: string;
  public currency!: string;
  public walletAddress!: string;

  public network!: string;
  public verifiedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static initialization method
}
    BuyerCryptoWallet.init(
      {
          id: {
              type: DataTypes.UUID,
              defaultValue: DataTypes.UUIDV4,
              primaryKey: true,
          },
          buyerId: {
              type: DataTypes.UUID,
              allowNull: false,
              field: 'buyer_id',
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
        tableName: 'buyer_crypto_wallets',
        timestamps: true,
        indexes: [
          {
            fields: ['buyer_id'],
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




export default BuyerCryptoWallet;
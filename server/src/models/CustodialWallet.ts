import { Model, DataTypes } from 'sequelize';
import { Currency } from '../utils/constants';
import sequelize from '@/config/database';

export interface ICustodialWallet {
  id: string;
  currency: string;
  address: string;
  network: string; // Encrypted

  createdAt: Date;
  updatedAt: Date;
}

class CustodialWallet extends Model<ICustodialWallet> implements ICustodialWallet {
  public id!: string;
  public currency!: string;
  public address!: string;
  public network!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  toJSON() {
    const values = { ...this.get() };

    return values;
  }
}


CustodialWallet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    currency: {
      type: DataTypes.ENUM(...Object.values(Currency).filter(c =>
        ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'XRP'].includes(c)
      )),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    network: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE }
  },
  {
    sequelize,
    tableName: 'custodial_wallets',
    timestamps: true,
  }
);


export default CustodialWallet;
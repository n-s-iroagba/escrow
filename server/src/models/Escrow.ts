import { Model, DataTypes } from 'sequelize';
import { TradeType, FeePayer, EscrowState } from '../utils/constants';
import sequelize from '@/config/database';

export interface IEscrow {
  id: string;
  tradeType: string;
  buyerEmail: string;
  buyerId?: string;
  isBuyerInitiated: boolean;
  sellerEmail: string;
  sellerId?: string;
  feePayer: string;
  buyCurrency: string;
  sellCurrency: string;
  amount: number;
  state: string;
  counterPartyConfirmationDeadline: Date;
  buyerConfirmedFunding?: boolean;
  sellerConfirmedFunding?: boolean;
  buyerMarkedPaymentSent?: boolean;
  sellerMarkedPaymentSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class Escrow extends Model<IEscrow> implements IEscrow {
  public id!: string;
  public tradeType!: string;
  public buyerEmail!: string;
  public buyerId?: string;
  public isBuyerInitiated!: boolean;
  public sellerEmail!: string;
  public sellerId?: string;
  public feePayer!: string;
  public buyCurrency!: string;
  public sellCurrency!: string;
  public amount!: number;
  public state!: string;
  public counterPartyConfirmationDeadline!: Date;
  public buyerConfirmedFunding?: boolean;
  public sellerConfirmedFunding?: boolean;
  public buyerMarkedPaymentSent?: boolean;
  public sellerMarkedPaymentSent?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Escrow.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tradeType: {
      type: DataTypes.ENUM(...Object.values(TradeType)),
      allowNull: false,
      field: 'trade_type',
    },
    buyerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'buyer_email',
    },
    buyerId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'buyer_id',
    },
    isBuyerInitiated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_buyer_initiated',
    },
    sellerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'seller_email',
    },
    sellerId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'seller_id',
    },
    feePayer: {
      type: DataTypes.ENUM(...Object.values(FeePayer)),
      allowNull: false,
      field: 'fee_payer',
    },
    buyCurrency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'buy_currency',
    },
    sellCurrency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'sell_currency',
    },
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    state: {
      type: DataTypes.ENUM(...Object.values(EscrowState)),
      allowNull: false,
      defaultValue: EscrowState.INITIALIZED,
    },
    counterPartyConfirmationDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'counter_party_confirmation_deadline',
    },
    buyerConfirmedFunding: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'buyer_confirmed_funding',
    },

    sellerConfirmedFunding: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'seller_confirmed_funding',
    },
    buyerMarkedPaymentSent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'buyer_marked_payment_sent',
    },
    sellerMarkedPaymentSent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'seller_marked_payment_sent',
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE }
  },
  {
    sequelize,
    tableName: 'escrows',
    timestamps: true,
    indexes: [
      {
        fields: ['buyer_id'],
      },
      {
        fields: ['seller_id'],
      },
      {
        fields: ['state'],
      },
      {
        fields: ['trade_type'],
      },
    ],
  }
);



export default Escrow;
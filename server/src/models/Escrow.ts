import { Model, DataTypes } from 'sequelize';
import { TradeType, FeePayer, EscrowState } from '../utils/constants';
import sequelize from '@/config/database';

export interface IEscrow {
  id: string;
  tradeType: string;
  buyerEmail: string;
  buyerId?: string;
  isBuyerInitiated: boolean;
  paymentMethod: string;
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
  buyerDepositWalletId?: string;
  sellerDepositWalletId?: string;
  sellerBankId?: string;
  buyerDepositBankId?: string;
  buyerDepositAmount?: number;
  sellerDepositAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

class Escrow extends Model<IEscrow> implements IEscrow {
  declare public id: string;
  declare public tradeType: string;
  declare public buyerEmail: string;
  declare public buyerId?: string;
  declare public isBuyerInitiated: boolean;
  declare public paymentMethod: string;
  declare public sellerEmail: string;
  declare public sellerId?: string;
  declare public feePayer: string;
  declare public buyCurrency: string;
  declare public sellCurrency: string;
  declare public amount: number;
  declare public state: string;
  declare public counterPartyConfirmationDeadline: Date;
  declare public buyerConfirmedFunding?: boolean;
  declare public sellerConfirmedFunding?: boolean;
  declare public buyerMarkedPaymentSent?: boolean;
  declare public sellerMarkedPaymentSent?: boolean;
  declare public buyerDepositWalletId?: string;
  declare public sellerDepositWalletId?: string;
  declare public sellerBankId?: string;
  declare public buyerDepositBankId?: string;
  declare public buyerDepositAmount?: number;
  declare public sellerDepositAmount?: number;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
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
    buyerDepositWalletId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'buyer_deposit_wallet_id',
    },
    buyerDepositBankId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'buyer_deposit_bank_id',
    },
    buyerDepositAmount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      field: 'buyer_deposit_amount',
    },
    sellerDepositAmount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      field: 'seller_deposit_amount',
    },
    sellerDepositWalletId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'seller_deposit_wallet_id',
    },
    sellerBankId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'seller_bank_id',
    },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    paymentMethod: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'payment_method',
    }
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
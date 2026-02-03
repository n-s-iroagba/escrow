import User from './User';
import Escrow from './Escrow';
import SellerBankAccount from './SellerBankAccount';
import SellerCryptoWallet from './SellerCryptoWallet';
import KYCDocument from './KYCDocument';

// User Associations
User.hasMany(Escrow, { foreignKey: 'buyerId', as: 'buyerEscrows' });
User.hasMany(Escrow, { foreignKey: 'sellerId', as: 'sellerEscrows' });
User.hasMany(SellerBankAccount, { foreignKey: 'sellerId', as: 'bankAccounts' });
User.hasMany(SellerCryptoWallet, { foreignKey: 'sellerId', as: 'cryptoWallets' });
User.hasOne(KYCDocument, { foreignKey: 'userId', as: 'kycDocument' });

// Escrow Associations
Escrow.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Escrow.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Financial Associations
SellerBankAccount.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
SellerCryptoWallet.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// KYC Associations
KYCDocument.belongsTo(User, { foreignKey: 'userId', as: 'user' });

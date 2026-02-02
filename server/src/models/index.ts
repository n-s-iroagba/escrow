
import sequelize from '../config/database';

// Import all models
import User from './User';
import Bank from './Bank';
import CustodialWallet from './CustodialWallet';
import Escrow from './Escrow';
import EscrowBankBalance from './EscrowBankBalance';
import EscrowCryptoWalletBalance from './EscrowCryptoWalletBalance';
import KYCDocument from './KYCDocument';


// Import associations
import './associations';

export {
  sequelize,
  User,
  Bank,
  CustodialWallet,
  Escrow,
  EscrowBankBalance,
  EscrowCryptoWalletBalance,
  KYCDocument,

};
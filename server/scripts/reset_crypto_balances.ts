
import sequelize from '../src/config/database';
import EscrowCryptoWalletBalance from '../src/models/EscrowCryptoWalletBalance';

async function resetCryptoBalances() {
    try {
        console.log('Syncing EscrowCryptoWalletBalance table...');
        await EscrowCryptoWalletBalance.sync({ force: true });
        console.log('EscrowCryptoWalletBalance table reset successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting EscrowCryptoWalletBalance table:', error);
        process.exit(1);
    }
}

resetCryptoBalances();

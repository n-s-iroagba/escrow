import SellerBankAccount from '../src/models/SellerBankAccount';
import sequelize from '../src/config/database';

async function resetSellerBanks() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established.');

        console.log('Resetting SellerBankAccount table...');
        await SellerBankAccount.sync({ force: true });
        console.log('SellerBankAccount table reset successfully.');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error resetting SellerBankAccount table:', error);
        process.exit(1);
    }
}

resetSellerBanks();

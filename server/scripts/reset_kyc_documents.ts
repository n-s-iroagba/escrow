import KYCDocument from '../src/models/KYCDocument';
import sequelize from '../src/config/database';

async function resetKYCDocuments() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established.');

        console.log('Resetting KYCDocument table...');
        await KYCDocument.sync({ force: true });
        console.log('KYCDocument table reset successfully.');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error resetting KYCDocument table:', error);
        process.exit(1);
    }
}

resetKYCDocuments();

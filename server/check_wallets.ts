
import CustodialWallet from './src/models/CustodialWallet';
import sequelize from './src/config/database';

async function checkWallets() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const wallets = await CustodialWallet.findAll();
        console.log('Count:', wallets.length);
        wallets.forEach(w => console.log(`${w.currency} - ${w.network} - ${w.address}`));

        const required = ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'XRP'];
        const existing = new Set(wallets.map(w => w.currency));

        const missing = required.filter(c => !existing.has(c));
        console.log('Missing Currencies:', missing);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkWallets();

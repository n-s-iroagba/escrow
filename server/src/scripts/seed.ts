import Bank from '../models/Bank';
import CustodialWallet from '../models/CustodialWallet';
import sequelize from '../config/database';
import { Currency } from '../utils/constants';

const seed = async () => {
    try {
        console.log('🌱 Starting database seed...');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Sync models (optional, but ensures tables exist)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
        }

        // --- Seed Banks ---
        const banks = [
            {
                name: 'GreenWealth Bank (USD)',
                accountNumber: '1234567890',
                currency: Currency.USD,
                recipientName: 'GreenWealth Inc.',
                bankAddress: '123 Wall St, New York, NY',
                routingNumber: '021000021'
            },
            {
                name: 'GreenWealth Bank (EUR)',
                accountNumber: 'DE501234567890',
                currency: Currency.EUR,
                recipientName: 'GreenWealth GmbH',
                bankAddress: '456 Market St, Frankfurt',
                iban: 'DE501234567890',
                swift: 'GWEADEFF'
            }
        ];

        console.log('🏦 Seeding Banks...');
        for (const bankData of banks) {
            const [bank, created] = await Bank.findOrCreate({
                where: { accountNumber: bankData.accountNumber },
                defaults: {
                    ...bankData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                } as any
            });
            console.log(`   ${created ? 'Created' : 'Found'} Bank: ${bank.name}`);
        }

        // --- Seed Custodial Wallets ---
        const wallets = [
            {
                currency: Currency.BTC,
                address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                privateKey: 'mock_private_key_btc', // encrypted in real app
                publicKey: 'mock_public_key_btc'
            },
            {
                currency: Currency.ETH,
                address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                privateKey: 'mock_private_key_eth',
                publicKey: 'mock_public_key_eth'
            },
            {
                currency: Currency.USDT,
                address: '0x82D7656EC7ab88b098defB751B7401B5f6d8977G', // Changed to be unique
                privateKey: 'mock_private_key_usdt',
                publicKey: 'mock_public_key_usdt'
            }
        ];

        console.log('👛 Seeding Custodial Wallets...');
        for (const walletData of wallets) {
            // Check by address usually
            const [wallet, created] = await CustodialWallet.findOrCreate({
                where: { address: walletData.address, currency: walletData.currency },
                defaults: {
                    ...walletData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                } as any
            });
            console.log(`   ${created ? 'Created' : 'Found'} Wallet: ${wallet.currency} (${wallet.address})`);
        }

        console.log('✅ Database seed completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Database seed failed:', error);
        process.exit(1);
    }
};

seed();

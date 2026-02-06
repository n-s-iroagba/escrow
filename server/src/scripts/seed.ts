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
        // Sync models (optional, but ensures tables exist)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ force: true });
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
        // --- Seed Custodial Wallets ---
        console.log('🧹 Clearing existing custodial wallets...');
        await CustodialWallet.destroy({ where: {}, truncate: true });

        const wallets = [
            // BTC Wallets
            {
                currency: Currency.BTC,
                address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                network: 'Bitcoin',
                privateKey: 'mock_private_key_btc_main',
                publicKey: 'mock_public_key_btc_main'
            },
            // ETH Wallets
            {
                currency: Currency.ETH,
                address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                network: 'Ethereum',
                privateKey: 'mock_private_key_eth_main',
                publicKey: 'mock_public_key_eth_main'
            },
            // USDT Wallets (Multiple Networks)
            {
                currency: Currency.USDT,
                address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                network: 'Ethereum (ERC20)',
                privateKey: 'mock_private_key_usdt_erc20',
                publicKey: 'mock_public_key_usdt_erc20'
            },
            {
                currency: Currency.USDT,
                address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
                network: 'Tron (TRC20)',
                privateKey: 'mock_private_key_usdt_trc20',
                publicKey: 'mock_public_key_usdt_trc20'
            },
            // USDC Wallets
            {
                currency: Currency.USDC,
                address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                network: 'Ethereum (ERC20)',
                privateKey: 'mock_private_key_usdc_erc20',
                publicKey: 'mock_public_key_usdc_erc20'
            },
            {
                currency: Currency.USDC,
                address: '7XwK1y3s8S...MockSolAddress', // Mock SOL address
                network: 'Solana',
                privateKey: 'mock_private_key_usdc_sol',
                publicKey: 'mock_public_key_usdc_sol'
            }
        ];

        console.log('👛 Seeding Custodial Wallets...');
        for (const walletData of wallets) {
            const wallet = await CustodialWallet.create({
                ...walletData,
                createdAt: new Date(),
                updatedAt: new Date()
            } as any);
            console.log(`   Created Wallet: ${wallet.currency} (${wallet.network}) - ${wallet.address}`);
        }

        console.log('✅ Database seed completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Database seed failed:', error);
        process.exit(1);
    }
};

seed();

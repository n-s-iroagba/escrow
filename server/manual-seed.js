const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'escrow',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    dialect: 'mysql',
    logging: console.log,
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
});

const seed = async () => {
    try {
        console.log('🌱 Starting manual database seed...');
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // --- Banks ---
        const banks = [
            {
                name: 'GreenWealth Bank (USD)',
                account_number: '1234567890',
                currency: 'USD',
                recipient_name: 'GreenWealth Inc.',
                bank_address: '123 Wall St, New York, NY',
                routing_number: '021000021',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'GreenWealth Bank (EUR)',
                account_number: 'DE501234567890',
                currency: 'EUR',
                recipient_name: 'GreenWealth GmbH',
                bank_address: '456 Market St, Frankfurt',
                iban: 'DE501234567890',
                swift: 'GWEADEFF',
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        for (const bank of banks) {
            // Check if exists
            const [results] = await sequelize.query(
                `SELECT id FROM banks WHERE account_number = :account_number LIMIT 1`,
                { replacements: { account_number: bank.account_number } }
            );

            if (results.length === 0) {
                const id = uuidv4();
                await sequelize.query(
                    `INSERT INTO banks (id, name, account_number, currency, recipient_name, bank_address, routing_number, iban, swift, created_at, updated_at)
                     VALUES (:id, :name, :account_number, :currency, :recipient_name, :bank_address, :routing_number, :iban, :swift, :created_at, :updated_at)`,
                    {
                        replacements: {
                            id,
                            ...bank,
                            iban: bank.iban || null,
                            swift: bank.swift || null,
                            routing_number: bank.routing_number || null
                        }
                    }
                );
                console.log(`   Created Bank: ${bank.name}`);
            } else {
                console.log(`   Found Bank: ${bank.name}`);
            }
        }

        // --- Custodial Wallets ---
        const wallets = [
            {
                currency: 'BTC',
                address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                private_key: 'mock_private_key_btc',
                public_key: 'mock_public_key_btc',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                currency: 'ETH',
                address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                private_key: 'mock_private_key_eth',
                public_key: 'mock_public_key_eth',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                currency: 'USDT',
                address: '0x82D7656EC7ab88b098defB751B7401B5f6d8977G',
                private_key: 'mock_private_key_usdt',
                public_key: 'mock_public_key_usdt',
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        for (const wallet of wallets) {
            const [results] = await sequelize.query(
                `SELECT id FROM custodial_wallets WHERE address = :address AND currency = :currency LIMIT 1`,
                { replacements: { address: wallet.address, currency: wallet.currency } }
            );

            if (results.length === 0) {
                const id = uuidv4();
                await sequelize.query(
                    `INSERT INTO custodial_wallets (id, currency, address, private_key, public_key, created_at, updated_at)
                     VALUES (:id, :currency, :address, :private_key, :public_key, :created_at, :updated_at)`,
                    {
                        replacements: {
                            id,
                            ...wallet
                        }
                    }
                );
                console.log(`   Created Wallet: ${wallet.currency}`);
            } else {
                console.log(`   Found Wallet: ${wallet.currency}`);
            }
        }

        console.log('✅ Manual seed completed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Manual seed failed:', error);
        process.exit(1);
    }
};

seed();

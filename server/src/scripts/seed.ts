import Bank from '../models/Bank';
import CustodialWallet from '../models/CustodialWallet';
import { Currency } from '../utils/constants';

export const seed = async () => {
    try {
        console.log('🌱 Starting database seed...');


        // --- Seed Banks ---
        const banks = [
            {
                name: 'Hero Systems, UAB (USD)',
                accountNumber: 'LT833910020000001852',
                currency: Currency.USD,
                swift: 'IBIULT21XXX',
                iban: "LT833910020000001852",
                recipientName: 'HERO SYSTEMS, UAB',
                bankAddress: 'Eišiškiy Sody 18-oji g. 11, Vilnius, Lithuania',
                routingNumber: '021000021'
            },

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
                address: 'bc1qe53qcw5y2t44jp276auj0mmvzf26rmktgw8074',
                network: 'mainnet',
                privateKey: '[ENCRYPTION_KEY]',
                publicKey: 'mock_public_key_btc_main'
            },


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

// seed();

import CustodialWalletRepository from '../repositories/CustodialWalletRepository';
import CustodialWallet, { ICustodialWallet } from '../models/CustodialWallet';

class CustodialWalletService {
    /**
     * Create a new custodial wallet
     */
    async createWallet(data: Partial<ICustodialWallet>): Promise<CustodialWallet> {
        return await CustodialWalletRepository.create(data);
    }

    /**
     * Get all custodial wallets
     */
    async getAllWallets(): Promise<CustodialWallet[]> {
        return await CustodialWalletRepository.findAll();
    }

    /**
     * Get wallet by ID
     */
    async getWalletById(id: string): Promise<CustodialWallet | null> {
        return await CustodialWalletRepository.findById(id);
    }

    /**
     * Get wallet by currency
     */
    async getWalletByCurrency(currency: string): Promise<CustodialWallet | null> {
        return await CustodialWalletRepository.findByCurrency(currency);
    }

    /**
     * Get wallets by currency (multiple if exist)
     */
    async getWalletsByCurrency(currency: string): Promise<CustodialWallet[]> {
        return await CustodialWallet.findAll({ where: { currency } });
    }

    /**
     * Update custodial wallet
     */
    async updateWallet(id: string, data: Partial<ICustodialWallet>): Promise<CustodialWallet | null> {
        const [affectedCount] = await CustodialWalletRepository.update(id, data);
        if (affectedCount === 0) return null;
        return await this.getWalletById(id);
    }

    /**
     * Delete custodial wallet
     */
    async deleteWallet(id: string): Promise<boolean> {
        const result = await CustodialWallet.destroy({ where: { id } });
        return result > 0;
    }

    /**
     * Check if wallet address exists
     */
    async walletExists(address: string): Promise<boolean> {
        const wallet = await CustodialWallet.findOne({ where: { address } });
        return !!wallet;
    }

    /**
     * Get wallet statistics
     */
    async getWalletStats(): Promise<{
        total: number;
        byCurrency: Record<string, number>;
        activeWallets: number;
    }> {
        const wallets = await this.getAllWallets();
        const byCurrency: Record<string, number> = {};
        let activeWallets = 0;

        wallets.forEach(wallet => {
            if (!byCurrency[wallet.currency]) {
                byCurrency[wallet.currency] = 0;
            }
            byCurrency[wallet.currency]++;

            // Count as active if it has an address
            if (wallet.address) {
                activeWallets++;
            }
        });

        return {
            total: wallets.length,
            byCurrency,
            activeWallets
        };
    }

    /**
     * Validate wallet address format (basic validation)
     */
    validateAddress(address: string, currency: string): boolean {
        // Basic validation - can be enhanced with specific crypto validation
        if (!address || address.length < 20) return false;

        switch (currency) {
            case 'BTC':
                return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
                    /^bc1[a-z0-9]{39,87}$/.test(address);
            case 'ETH':
            case 'USDT':
            case 'USDC':
                return /^0x[a-fA-F0-9]{40}$/.test(address);
            default:
                return address.length >= 20;
        }
    }
}

export default new CustodialWalletService();

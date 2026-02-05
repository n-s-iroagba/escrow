'use client';

import { useGet, usePost } from '@/hooks/useApiQuery';
import API_ROUTES from '@/constants/api-routes';
import { useParams, useRouter } from 'next/navigation';
import { TradeType, PaymentMethod } from '@/constants/enums';
import { Copy, ArrowRight, Banknote, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRequiredAuth } from '@/hooks/useAuthContext';

declare global {
    interface Window {
        paypal?: any;
    }
}

export default function FundEscrowPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useRequiredAuth();

    const [wireRef, setWireRef] = useState('');
    const [cryptoTxHash, setCryptoTxHash] = useState('');
    const [paypalLoaded, setPaypalLoaded] = useState(false);

    // Fetch generic funding details (System wallets/banks)
    const { data: fundingDetails, loading: loadingDetails } = useGet(
        API_ROUTES.ESCROWS.GET_FUNDING_DETAILS(id as string),
        { enabled: !!id }
    );

    const { data: escrow, loading: loadingEscrow } = useGet(
        API_ROUTES.ESCROWS.GET_ONE(id as string),
        { enabled: !!id }
    );

    const { post: fundEscrow, isPending: isFunding } = usePost(
        API_ROUTES.ESCROWS.FUND(id as string),
        {
            onSuccess: () => {
                router.push(`/escrow/${id}`);
            }
        }
    );

    // Initialize PayPal Buttons when SDK is ready and it's a PayPal transaction
    useEffect(() => {
        if (paypalLoaded && window.paypal && escrow?.paymentMethod === 'PAYPAL' && !escrow?.buyerConfirmedFunding) {
            // Render button logic would go here if we had a dedicated container ref
            // For React, usually we use the React Wrapper, but raw JS SDK works too:
            try {
                window.paypal.Buttons({
                    createOrder: (data: any, actions: any) => {
                        return actions.order.create({
                            purchase_units: [{
                                description: `Escrow Transaction #${id}`,
                                amount: {
                                    value: escrow.amount.toString() // Ensure string/decimal format
                                }
                            }]
                        });
                    },
                    onApprove: async (data: any, actions: any) => {
                        const order = await actions.order.capture();
                        console.log('PayPal Order Captured:', order);
                        // Call Backend to Mark as Funded
                        await fundEscrow({
                            transactionHash: order.id,
                            amount: escrow.amount
                        });
                    },
                    onError: (err: any) => {
                        console.error('PayPal Error', err);
                    }
                }).render('#paypal-button-container');
            } catch (e) {
                console.error("PayPal button render failed", e);
            }
        }
    }, [paypalLoaded, escrow, id, fundEscrow]);


    if (loadingDetails || loadingEscrow) return <div className="p-12 text-center text-gray-500">Loading funding options...</div>;
    if (!escrow || !fundingDetails) return <div className="p-12 text-center text-red-500">Unable to load transaction data</div>;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleWireSubmit = async () => {
        if (!wireRef) return;
        await fundEscrow({
            wireReference: wireRef,
            bankId: fundingDetails.adminBank?.id,
            amount: escrow.amount
        });
    };

    const handleCryptoSubmit = async () => {
        if (!cryptoTxHash) return;
        await fundEscrow({
            transactionHash: cryptoTxHash,
            amount: escrow.amount
        });
    };

    const isWire = escrow.tradeType === TradeType.CRYPTO_TO_FIAT && (escrow as any).paymentMethod === PaymentMethod.WIRE_TRANSFER;
    const isPayPal = escrow.tradeType === TradeType.CRYPTO_TO_FIAT && (escrow as any).paymentMethod === PaymentMethod.PAYPAL;

    const isBuyer = user?.id === escrow.buyerId;
    const isSeller = user?.id === escrow.sellerId;

    // Logic for what to show based on User Role & Trade Type (User Rules)
    let showCrypto = false;
    let showBank = false;
    let targetWallet = null;
    let paymentCurrency = '';

    if (escrow.tradeType === TradeType.CRYPTO_TO_CRYPTO) {
        showCrypto = true;
        // C2C Requirement:
        // Buyer -> Custodial Wallet for BuyCurrency
        // Seller -> Custodial Wallet for SellCurrency
        if (isBuyer) {
            targetWallet = fundingDetails.buyerFundingWallet;
            paymentCurrency = escrow.buyCurrency;
        } else if (isSeller) {
            targetWallet = fundingDetails.sellerFundingWallet;
            paymentCurrency = escrow.sellCurrency;
        }
    } else if (escrow.tradeType === TradeType.CRYPTO_TO_FIAT) {
        // C2F Requirement:
        // Buyer (Fiat/Wire) -> EscrowBankBalance.bank (fundingDetails.adminBank)
        // Seller (Crypto) -> Custodial Wallet matching SellCurrency (fundingDetails.sellerFundingWallet)

        if (isBuyer) {
            if (isWire) {
                showBank = true; // Show Admin Bank Details
                paymentCurrency = escrow.buyCurrency; // Fiat
            }
            // PayPal handled separately via isPayPal check
        } else if (isSeller) {
            // Seller pays Crypto
            showCrypto = true;
            targetWallet = fundingDetails.sellerFundingWallet;
            paymentCurrency = escrow.sellCurrency;
        }
    }

    return (
        <div className="min-h-screen bg-[#f6f8f6] p-8 font-display text-[#0d1b12] flex items-center justify-center">

            {/* PayPal Maintenance Modal */}
            {isPayPal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Banknote className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">System Maintenance</h2>
                        <p className="text-gray-500 mb-6">
                            PayPal is currently undergoing scheduled maintenance. Please try again later or select an alternative payment method.
                        </p>
                        <button
                            onClick={() => router.back()}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 px-6 rounded-xl w-full"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden PayPal Script (Preserving implementation as requested, but UI blocked by Modal) */}
            {isPayPal && !isBuyer && (
                <Script
                    src={`https://www.paypal.com/sdk/js?client-id=test&currency=${escrow.buyCurrency || 'USD'}`}
                    onLoad={() => setPaypalLoaded(true)}
                />
            )}

            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Secure Funding</h1>
                    <p className="text-gray-500">
                        Please proceed with the payment of <strong className="text-gray-900">{escrow.amount} {paymentCurrency || escrow.buyCurrency}</strong>
                    </p>
                    <div className="flex justify-center mt-2">
                        <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-100 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Escrow Protection Active
                        </span>
                    </div>
                </div>

                {showBank && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-gray-400" />
                                Bank Wire Details (Administrator)
                            </h3>
                            {/* Only show details if they exist in fundingDetails.adminBank */}
                            {fundingDetails.adminBank ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase font-bold">Bank Name</p>
                                        <p className="font-medium text-gray-900">{fundingDetails.adminBank?.bankName || fundingDetails.adminBank?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase font-bold">Account Holder</p>
                                        <p className="font-medium text-gray-900">{fundingDetails.adminBank?.accountHolderName}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 text-xs uppercase font-bold">Account Number</p>
                                        <div className="flex items-center gap-2">
                                            <code className="text-lg font-mono font-bold text-gray-900">{fundingDetails.adminBank?.accountNumber}</code>
                                            <button onClick={() => handleCopy(fundingDetails.adminBank?.accountNumber)}><Copy className="w-4 h-4 text-gray-400 hover:text-green-500" /></button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase font-bold">Routing/ACH</p>
                                        <p className="font-mono text-gray-700">{fundingDetails.adminBank?.routingNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase font-bold">SWIFT/BIC</p>
                                        <p className="font-mono text-gray-700">{fundingDetails.adminBank?.swift || 'N/A'}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-red-500">Admin bank details unavailable.</p>
                            )}

                            <div className="mt-6 p-4 bg-white rounded-xl border border-blue-100 text-blue-800 text-sm">
                                Please verify the <strong>Reference Code</strong> on your wire transfer:
                                <br />
                                <code className="block mt-2 font-mono font-bold bg-blue-50 p-2 rounded text-center">ESC-{escrow.id.substring(0, 8).toUpperCase()}</code>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Wire Reference / Confirmation Code</label>
                            <input
                                data-testid="wire-reference-input"
                                type="text"
                                value={wireRef}
                                onChange={(e) => setWireRef(e.target.value)}
                                placeholder="Enter the wire reference number provided by your bank"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#13ec5b]"
                            />
                        </div>

                        <button
                            data-testid="confirm-wire-button"
                            onClick={handleWireSubmit}
                            disabled={isFunding || !wireRef}
                            className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${!wireRef ? 'bg-gray-100 text-gray-400' : 'bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] shadow-green-200'}`}
                        >
                            {isFunding ? 'Marking as Sent...' : 'Mark as Sent'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* PayPal Section (Only visible if not modal blocked, but technically blocked by modal above) */}
                {isPayPal && !true && ( // Force hidden for now as per requirement to show modal instead
                    <div className="space-y-6">
                        {/* Original PayPal UI Code - Preserved but Hidden */}
                        <div className="bg-white p-4 text-center">
                            <p className="text-gray-600 mb-6 font-medium">Click below to pay via PayPal securely.</p>
                            <div data-testid="paypal-button-container" id="paypal-button-container" className="min-h-[150px]"></div>
                        </div>
                    </div>
                )}

                {showCrypto && targetWallet && (
                    <div className="space-y-6">
                        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-lg">Deposit {paymentCurrency}</h3>
                                    <p className="text-gray-400 text-sm">Send exact amount to the address below</p>
                                </div>
                                <div className="bg-gray-800 p-2 rounded-lg">
                                    <span className="font-mono font-bold">{paymentCurrency}</span>
                                </div>
                            </div>

                            <div className="bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-white/10 mb-4">
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Custodial Address</label>
                                <div className="flex items-center gap-3 mt-1">
                                    <code className="text-sm font-mono break-all flex-1 text-green-400">{targetWallet?.walletAddress || targetWallet?.address || 'Address Generation Pending...'}</code>
                                    <button onClick={() => handleCopy(targetWallet?.walletAddress || targetWallet?.address)} className="hover:text-green-400 transition-colors"><Copy className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Transaction Hash (TxID)</label>
                            <input
                                data-testid="crypto-tx-hash-input"
                                type="text"
                                value={cryptoTxHash}
                                onChange={(e) => setCryptoTxHash(e.target.value)}
                                placeholder="0x..."
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#13ec5b]"
                            />
                        </div>

                        <button
                            data-testid="confirm-crypto-button"
                            onClick={handleCryptoSubmit}
                            disabled={isFunding || !cryptoTxHash}
                            className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${!cryptoTxHash ? 'bg-gray-100 text-gray-400' : 'bg-[#13ec5b] hover:bg-[#10c94d] text-[#0d1b12] shadow-green-200'}`}
                        >
                            {isFunding ? 'Marking as Sent...' : 'Mark as Sent'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

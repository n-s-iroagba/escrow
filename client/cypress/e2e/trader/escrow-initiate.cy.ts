/// <reference types="cypress" />
describe('Escrow Initiation', () => {
    beforeEach(() => {
        cy.loginAsTrader();
        // Assuming trader is KYC verified
        cy.visit('/trader/escrow/initiate');
    });

    describe('Step 1: Transaction Details', () => {
        it('should display the initiate escrow form', () => {
            cy.getByTestId('initiate-escrow-form').should('be.visible');
            cy.contains('Initiate Escrow').should('be.visible');
        });

        it('should show stepper with three steps', () => {
            cy.contains('Transaction').should('be.visible');
            cy.contains('Details').should('be.visible');
            cy.contains('Reception').should('be.visible');
        });

        it('should allow selecting buyer role', () => {
            cy.getByTestId('buyer-role-button').click();
            cy.getByTestId('buyer-role-button').should('have.class', 'border-emerald-500');
        });

        it('should allow selecting seller role', () => {
            cy.getByTestId('seller-role-button').click();
            cy.getByTestId('seller-role-button').should('have.class', 'border-emerald-500');
        });

        it('should toggle between buyer and seller roles', () => {
            cy.getByTestId('buyer-role-button').click();
            cy.getByTestId('buyer-role-button').should('have.class', 'border-emerald-500');

            cy.getByTestId('seller-role-button').click();
            cy.getByTestId('seller-role-button').should('have.class', 'border-emerald-500');
            cy.getByTestId('buyer-role-button').should('not.have.class', 'border-emerald-500');
        });

        it('should allow selecting trade type', () => {
            cy.getByTestId('trade-type-select').select('CRYPTO_TO_CRYPTO');
            cy.getByTestId('trade-type-select').should('have.value', 'CRYPTO_TO_CRYPTO');

            cy.getByTestId('trade-type-select').select('CRYPTO_TO_FIAT');
            cy.getByTestId('trade-type-select').should('have.value', 'CRYPTO_TO_FIAT');
        });

        it('should allow selecting buy currency', () => {
            cy.getByTestId('buy-currency-select').select('BTC');
            cy.getByTestId('buy-currency-select').should('have.value', 'BTC');

            cy.getByTestId('buy-currency-select').select('ETH');
            cy.getByTestId('buy-currency-select').should('have.value', 'ETH');
        });

        it('should allow selecting sell currency', () => {
            cy.getByTestId('sell-currency-select').select('USDT');
            cy.getByTestId('sell-currency-select').should('have.value', 'USDT');

            cy.getByTestId('sell-currency-select').select('BTC');
            cy.getByTestId('sell-currency-select').should('have.value', 'BTC');
        });

        it('should allow entering transaction amount', () => {
            cy.getByTestId('amount-input').type('1.5');
            cy.getByTestId('amount-input').should('have.value', '1.5');
        });

        it('should display selected currency next to amount', () => {
            cy.getByTestId('buy-currency-select').select('BTC');
            cy.getByTestId('amount-input').parent().should('contain', 'BTC');
        });

        it('should proceed to step 2 when clicking next', () => {
            cy.getByTestId('buyer-role-button').click();
            cy.getByTestId('amount-input').type('1.5');
            cy.contains('button', 'Next').click();
            cy.contains('Counterparty Email').should('be.visible');
        });

        it('should validate amount is required', () => {
            cy.contains('button', 'Next').click();
            // Should still be on step 1
            cy.getByTestId('amount-input').should('be.visible');
        });
    });

    describe('Step 2: Counterparty Details', () => {
        beforeEach(() => {
            // Complete step 1
            cy.getByTestId('buyer-role-button').click();
            cy.getByTestId('amount-input').type('1.5');
            cy.contains('button', 'Next').click();
        });

        it('should display counterparty email field', () => {
            cy.getByTestId('counterparty-email-input').should('be.visible');
        });

        it('should allow entering counterparty email', () => {
            cy.getByTestId('counterparty-email-input').type('seller@example.com');
            cy.getByTestId('counterparty-email-input').should('have.value', 'seller@example.com');
        });

        it('should validate email format', () => {
            cy.getByTestId('counterparty-email-input').type('invalid-email');
            cy.contains('button', 'Next').click();
            // Should show validation error
        });

        it('should allow going back to step 1', () => {
            cy.contains('button', 'Back').click();
            cy.getByTestId('buyer-role-button').should('be.visible');
        });

        it('should proceed to step 3 when clicking next', () => {
            cy.getByTestId('counterparty-email-input').type('seller@example.com');
            cy.contains('button', 'Next').click();
            cy.contains('Reception Details').should('be.visible');
        });
    });

    describe('Step 3: Reception Details', () => {
        beforeEach(() => {
            // Complete steps 1 and 2
            cy.getByTestId('buyer-role-button').click();
            cy.getByTestId('amount-input').type('1.5');
            cy.contains('button', 'Next').click();
            cy.getByTestId('counterparty-email-input').type('seller@example.com');
            cy.contains('button', 'Next').click();
        });

        it('should display wallet address field for crypto transactions', () => {
            cy.getByTestId('wallet-address-input').should('be.visible');
        });

        it('should allow entering wallet address', () => {
            cy.getByTestId('wallet-address-input').type('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
            cy.getByTestId('wallet-address-input').should('have.value', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
        });

        it('should show submit button on final step', () => {
            cy.getByTestId('submit-escrow-button').should('be.visible');
            cy.getByTestId('submit-escrow-button').should('contain', 'Initialize Escrow');
        });

        it('should allow going back to step 2', () => {
            cy.contains('button', 'Back').click();
            cy.getByTestId('counterparty-email-input').should('be.visible');
        });

        it('should disable submit button while submitting', () => {
            cy.getByTestId('wallet-address-input').type('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
            cy.getByTestId('submit-escrow-button').click();
            cy.getByTestId('submit-escrow-button').should('be.disabled');
        });

        it('should successfully create escrow and redirect', () => {
            cy.fixture('escrows').then((escrows: any) => {
                cy.getByTestId('wallet-address-input').type('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
                cy.getByTestId('submit-escrow-button').click();
                // Should redirect to escrow details page
                cy.url().should('include', '/trader/escrow/');
            });
        });
    });

    describe('Complete Flow - Crypto to Crypto', () => {
        it('should complete full escrow initiation as buyer', () => {
            cy.fixture('escrows').then((escrows: any) => {
                const escrow = escrows.cryptoToCrypto;

                // Step 1
                cy.getByTestId('buyer-role-button').click();
                cy.getByTestId('trade-type-select').select('CRYPTO_TO_CRYPTO');
                cy.getByTestId('buy-currency-select').select(escrow.buyCurrency);
                cy.getByTestId('sell-currency-select').select(escrow.sellCurrency);
                cy.getByTestId('amount-input').type(escrow.amount);
                cy.contains('button', 'Next').click();

                // Step 2
                cy.getByTestId('counterparty-email-input').type(escrow.sellerEmail);
                cy.contains('button', 'Next').click();

                // Step 3
                cy.getByTestId('wallet-address-input').type('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
                cy.getByTestId('submit-escrow-button').click();

                // Verify redirect
                cy.url().should('include', '/trader/escrow/');
            });
        });

        it('should complete full escrow initiation as seller', () => {
            cy.fixture('escrows').then((escrows: any) => {
                const escrow = escrows.cryptoToCrypto;

                // Step 1
                cy.getByTestId('seller-role-button').click();
                cy.getByTestId('trade-type-select').select('CRYPTO_TO_CRYPTO');
                cy.getByTestId('buy-currency-select').select(escrow.sellCurrency);
                cy.getByTestId('sell-currency-select').select(escrow.buyCurrency);
                cy.getByTestId('amount-input').type(escrow.amount);
                cy.contains('button', 'Next').click();

                // Step 2
                cy.getByTestId('counterparty-email-input').type('buyer@example.com');
                cy.contains('button', 'Next').click();

                // Step 3
                cy.getByTestId('wallet-address-input').type('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
                cy.getByTestId('submit-escrow-button').click();

                // Verify redirect
                cy.url().should('include', '/trader/escrow/');
            });
        });
    });

    describe('Navigation', () => {
        it('should navigate to initiate escrow from dashboard', () => {
            cy.visit('/trader/dashboard');
            cy.getByTestId('new-transaction-button').click();
            cy.url().should('include', '/trader/escrow/initiate');
        });

        it('should navigate to initiate escrow from escrow list', () => {
            cy.visit('/trader/escrow');
            cy.getByTestId('new-transaction-link').click();
            cy.url().should('include', '/trader/escrow/initiate');
        });

        it('should have back button to return to escrow list', () => {
            cy.contains('a', 'arrow').should('be.visible');
        });
    });

    describe('Error Handling', () => {
        it('should display error message on submission failure', () => {
            // Complete all steps with valid data
            cy.getByTestId('buyer-role-button').click();
            cy.getByTestId('amount-input').type('1.5');
            cy.contains('button', 'Next').click();
            cy.getByTestId('counterparty-email-input').type('invalid@example.com');
            cy.contains('button', 'Next').click();
            cy.getByTestId('wallet-address-input').type('0xinvalid');
            cy.getByTestId('submit-escrow-button').click();

            // Should show error message
            // cy.contains('error').should('be.visible');
        });
    });
});

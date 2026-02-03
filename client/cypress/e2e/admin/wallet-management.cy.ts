/// <reference types="cypress" />
describe('Admin Custodial Wallet Management', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });

    describe('Wallet List Page', () => {
        beforeEach(() => {
            cy.visit('/admin/custodial-wallet');
        });

        it('should display wallet list page', () => {
            cy.contains('Custodial Wallets').should('be.visible');
            cy.contains('Manage platform custody wallets').should('be.visible');
        });

        it('should have add wallet button', () => {
            cy.getByTestId('add-wallet-link').should('be.visible');
            cy.getByTestId('add-wallet-link').should('contain', 'Add Wallet');
        });

        it('should display search input', () => {
            cy.contains('Search wallets...').should('be.visible');
        });

        it('should display wallet cards when wallets exist', () => {
            cy.intercept('GET', '**/api/custodial-wallets', { fixture: 'wallets.json' }).as('getWallets');
            cy.visit('/admin/custodial-wallet');
            cy.wait('@getWallets');
            cy.get('[class*="bg-white rounded-2xl"]').should('have.length.greaterThan', 0);
        });

        it('should show empty state when no wallets', () => {
            cy.intercept('GET', '**/api/custodial-wallets', { body: [] }).as('getWallets');
            cy.visit('/admin/custodial-wallet');
            cy.wait('@getWallets');
            cy.contains('No Wallets Configured').should('be.visible');
        });

        it('should navigate to add wallet page', () => {
            cy.getByTestId('add-wallet-link').click();
            cy.url().should('include', '/admin/custodial-wallet/new');
        });

        it('should display wallet currency and address', () => {
            cy.intercept('GET', '**/api/custodial-wallets', { fixture: 'wallets.json' }).as('getWallets');
            cy.visit('/admin/custodial-wallet');
            cy.wait('@getWallets');

            // Should show currency badges
            cy.contains('BTC').should('be.visible');
        });
    });

    describe('New Wallet Page', () => {
        beforeEach(() => {
            cy.visit('/admin/custodial-wallet/new');
        });

        it('should display new wallet form', () => {
            cy.contains('Add Custodial Wallet').should('be.visible');
            cy.getByTestId('new-wallet-form').should('be.visible');
        });

        it('should have all required form fields', () => {
            cy.getByTestId('currency-select').should('be.visible');
            cy.getByTestId('wallet-address-input').should('be.visible');
        });

        it('should show currency options', () => {
            cy.getByTestId('currency-select').select('BTC');
            cy.getByTestId('currency-select').should('have.value', 'BTC');

            cy.getByTestId('currency-select').select('ETH');
            cy.getByTestId('currency-select').should('have.value', 'ETH');

            cy.getByTestId('currency-select').select('USDT');
            cy.getByTestId('currency-select').should('have.value', 'USDT');
        });

        it('should validate required fields', () => {
            cy.getByTestId('submit-wallet-button').click();

            // HTML5 validation should prevent submission
            cy.getByTestId('wallet-address-input').then(($input: any) => {
                expect($input[0].validationMessage).to.not.be.empty;
            });
        });

        it('should submit form with valid data', () => {
            cy.intercept('POST', '**/api/custodial-wallets', {
                statusCode: 201,
                body: { id: '1', currency: 'BTC', address: '0x123...' }
            }).as('createWallet');

            cy.getByTestId('currency-select').select('BTC');
            cy.getByTestId('wallet-address-input').type('0x1234567890abcdef');
            cy.get('input[name="publicKey"]').type('public-key-123');
            cy.get('textarea[name="privateKey"]').type('private-key-456');
            cy.getByTestId('submit-wallet-button').click();

            cy.wait('@createWallet');
            cy.url().should('include', '/admin/custodial-wallet');
            cy.url().should('not.include', '/new');
        });

        it('should show security warning for private key', () => {
            cy.contains('Warning: Handle private keys with extreme care').should('be.visible');
        });

        it('should show loading state during submission', () => {
            cy.intercept('POST', '**/api/custodial-wallets', { delay: 1000, body: {} }).as('createWallet');

            cy.getByTestId('currency-select').select('BTC');
            cy.getByTestId('wallet-address-input').type('0x123');
            cy.get('input[name="publicKey"]').type('pub');
            cy.get('textarea[name="privateKey"]').type('priv');
            cy.getByTestId('submit-wallet-button').click();

            cy.getByTestId('submit-wallet-button').should('contain', 'Creating...');
            cy.getByTestId('submit-wallet-button').should('be.disabled');
        });
    });

    describe('Wallet Details Page', () => {
        beforeEach(() => {
            cy.intercept('GET', '**/api/custodial-wallets/*', {
                body: {
                    id: '1',
                    currency: 'BTC',
                    address: '0x1234567890abcdef',
                    publicKey: 'public-key-123'
                }
            }).as('getWallet');
            cy.visit('/admin/custodial-wallet/1');
        });

        it('should display wallet details', () => {
            cy.wait('@getWallet');
            cy.contains('Wallet Details').should('be.visible');
            cy.getByTestId('wallet-details-container').should('be.visible');
        });

        it('should have edit wallet link', () => {
            cy.wait('@getWallet');
            cy.getByTestId('edit-wallet-link').should('be.visible');
            cy.getByTestId('edit-wallet-link').should('contain', 'Edit Wallet');
        });

        it('should navigate to edit page', () => {
            cy.wait('@getWallet');
            cy.getByTestId('edit-wallet-link').click();
            cy.url().should('include', '/edit');
        });

        it('should display wallet information', () => {
            cy.wait('@getWallet');
            cy.contains('Wallet Address').should('be.visible');
            cy.contains('Public Key').should('be.visible');
            cy.contains('Private Key').should('be.visible');
        });

        it('should obscure private key', () => {
            cy.wait('@getWallet');
            cy.contains('••••••••').should('be.visible');
        });
    });

    describe('Edit Wallet Page', () => {
        beforeEach(() => {
            cy.intercept('GET', '**/api/custodial-wallets/*', {
                body: {
                    id: '1',
                    currency: 'BTC',
                    address: '0x1234567890abcdef',
                    publicKey: 'public-key-123',
                    privateKey: 'private-key-456'
                }
            }).as('getWallet');
            cy.visit('/admin/custodial-wallet/1/edit');
        });

        it('should display edit wallet form', () => {
            cy.wait('@getWallet');
            cy.contains('Edit Custodial Wallet').should('be.visible');
            cy.getByTestId('edit-wallet-form').should('be.visible');
        });

        it('should pre-populate form with existing data', () => {
            cy.wait('@getWallet');
            cy.getByTestId('currency-select').should('have.value', 'BTC');
            cy.getByTestId('wallet-address-input').should('have.value', '0x1234567890abcdef');
        });

        it('should update wallet successfully', () => {
            cy.wait('@getWallet');
            cy.intercept('PUT', '**/api/custodial-wallets/*', {
                statusCode: 200,
                body: { id: '1', currency: 'ETH' }
            }).as('updateWallet');

            cy.getByTestId('currency-select').select('ETH');
            cy.getByTestId('submit-wallet-button').click();

            cy.wait('@updateWallet');
            cy.url().should('include', '/admin/custodial-wallet');
            cy.url().should('not.include', '/edit');
        });

        it('should show warning about private key update', () => {
            cy.wait('@getWallet');
            cy.contains('Warning: Updating this will overwrite the existing key').should('be.visible');
        });
    });
});

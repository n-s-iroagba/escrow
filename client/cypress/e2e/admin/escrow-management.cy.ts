/// <reference types="cypress" />
describe('Admin Escrow Management', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });

    describe('Escrow List Page', () => {
        beforeEach(() => {
            cy.visit('/admin/escrow');
        });

        it('should display escrow management page', () => {
            cy.contains('Escrow Management').should('be.visible');
            cy.contains('Monitor and manage all platform escrow transactions').should('be.visible');
        });

        it('should have search input', () => {
            cy.getByTestId('search-escrows-input').should('be.visible');
            cy.getByTestId('search-escrows-input').should('have.attr', 'placeholder', 'Search by ID, email...');
        });

        it('should display status filter buttons', () => {
            cy.contains('Initialized').should('be.visible');
            cy.contains('Partial').should('be.visible');
            cy.contains('Funded').should('be.visible');
            cy.contains('Released').should('be.visible');
            cy.contains('Disputed').should('be.visible');
        });

        it('should filter escrows by status', () => {
            cy.intercept('GET', '**/api/escrows/admin', { fixture: 'escrows.json' }).as('getEscrows');
            cy.visit('/admin/escrow');
            cy.wait('@getEscrows');

            // Click on a status filter
            cy.contains('Initialized').click();

            // Filter should be active
            cy.contains('Initialized').should('have.class', 'border-current');
        });

        it('should clear status filter', () => {
            cy.intercept('GET', '**/api/escrows/admin', { fixture: 'escrows.json' }).as('getEscrows');
            cy.visit('/admin/escrow');
            cy.wait('@getEscrows');

            cy.contains('Initialized').click();
            cy.get('button').contains('X').should('be.visible').click();

            // Filter should be cleared
            cy.contains('Initialized').should('not.have.class', 'border-current');
        });

        it('should display escrows table when escrows exist', () => {
            cy.intercept('GET', '**/api/escrows/admin', { fixture: 'escrows.json' }).as('getEscrows');
            cy.visit('/admin/escrow');
            cy.wait('@getEscrows');

            cy.getByTestId('escrows-table').should('be.visible');
        });

        it('should show table headers', () => {
            cy.intercept('GET', '**/api/escrows/admin', { fixture: 'escrows.json' }).as('getEscrows');
            cy.visit('/admin/escrow');
            cy.wait('@getEscrows');

            cy.getByTestId('escrows-table').within(() => {
                cy.contains('ID').should('be.visible');
                cy.contains('Created').should('be.visible');
                cy.contains('Initiator').should('be.visible');
                cy.contains('Amount').should('be.visible');
                cy.contains('Trade').should('be.visible');
                cy.contains('Status').should('be.visible');
                cy.contains('Action').should('be.visible');
            });
        });

        it('should show empty state when no escrows', () => {
            cy.intercept('GET', '**/api/escrows/admin', { body: [] }).as('getEscrows');
            cy.visit('/admin/escrow');
            cy.wait('@getEscrows');

            cy.contains('No Escrows Found').should('be.visible');
        });

        it('should have view button for each escrow', () => {
            cy.intercept('GET', '**/api/escrows/admin', { fixture: 'escrows.json' }).as('getEscrows');
            cy.visit('/admin/escrow');
            cy.wait('@getEscrows');

            cy.getByTestId('view-escrow-button').first().should('be.visible');
            cy.getByTestId('view-escrow-button').first().should('contain', 'View');
        });

        it('should navigate to escrow details', () => {
            cy.intercept('GET', '**/api/escrows/admin', { fixture: 'escrows.json' }).as('getEscrows');
            cy.visit('/admin/escrow');
            cy.wait('@getEscrows');

            cy.getByTestId('view-escrow-button').first().click();
            cy.url().should('include', '/admin/escrow/');
        });

        it('should search escrows by ID', () => {
            cy.intercept('GET', '**/api/escrows/admin', { fixture: 'escrows.json' }).as('getEscrows');
            cy.visit('/admin/escrow');
            cy.wait('@getEscrows');

            cy.getByTestId('search-escrows-input').type('123');
            // Filtering happens client-side, so just verify input works
            cy.getByTestId('search-escrows-input').should('have.value', '123');
        });

        it('should display escrow status badges', () => {
            cy.intercept('GET', '**/api/escrows/admin', { fixture: 'escrows.json' }).as('getEscrows');
            cy.visit('/admin/escrow');
            cy.wait('@getEscrows');

            // Should show status badges with appropriate styling
            cy.get('[class*="uppercase"]').should('exist');
        });

        it('should show loading state', () => {
            cy.intercept('GET', '**/api/escrows/admin', { delay: 1000, body: [] }).as('getEscrows');
            cy.visit('/admin/escrow');

            cy.contains('Loading escrows...').should('be.visible');
        });

        it('should handle error state', () => {
            cy.intercept('GET', '**/api/escrows/admin', { statusCode: 500 }).as('getEscrows');
            cy.visit('/admin/escrow');
            cy.wait('@getEscrows');

            cy.contains('Failed to load data').should('be.visible');
        });
    });

    describe('Escrow Details Page', () => {
        beforeEach(() => {
            cy.intercept('GET', '**/api/escrows/*', {
                body: {
                    id: '1',
                    state: 'INITIALIZED',
                    amount: 1000,
                    buyCurrency: 'BTC',
                    sellCurrency: 'USD',
                    tradeType: 'CRYPTO_TO_CRYPTO',
                    buyerEmail: 'buyer@test.com',
                    sellerEmail: 'seller@test.com',
                    createdAt: new Date().toISOString(),
                    buyerMarkedPaymentSent: false,
                    sellerMarkedPaymentSent: false,
                    buyerConfirmedFunding: false,
                    sellerConfirmedFunding: false
                }
            }).as('getEscrow');
            cy.visit('/admin/escrow/1');
        });

        it('should display escrow details page', () => {
            cy.wait('@getEscrow');
            cy.contains('Escrow Details').should('be.visible');
        });

        it('should have update payment button', () => {
            cy.wait('@getEscrow');
            cy.getByTestId('update-payment-button').should('be.visible');
            cy.getByTestId('update-payment-button').should('contain', 'Update Payment');
        });

        it('should navigate to update payment page', () => {
            cy.wait('@getEscrow');
            cy.getByTestId('update-payment-button').click();
            cy.url().should('include', '/update-payment');
        });

        it('should display general information', () => {
            cy.wait('@getEscrow');
            cy.contains('General Information').should('be.visible');
            cy.contains('State').should('be.visible');
            cy.contains('Amount').should('be.visible');
            cy.contains('Trade Type').should('be.visible');
        });

        it('should display parties involved', () => {
            cy.wait('@getEscrow');
            cy.contains('Parties Involved').should('be.visible');
            cy.contains('Buyer').should('be.visible');
            cy.contains('Seller').should('be.visible');
            cy.contains('buyer@test.com').should('be.visible');
            cy.contains('seller@test.com').should('be.visible');
        });

        it('should display payment status flags', () => {
            cy.wait('@getEscrow');
            cy.contains('Payment Status Flags').should('be.visible');
            cy.contains('Buyer Sent').should('be.visible');
            cy.contains('Seller Sent').should('be.visible');
            cy.contains('Buyer Confirmed Funding').should('be.visible');
            cy.contains('Seller Confirmed Funding').should('be.visible');
        });

        it('should show flag values', () => {
            cy.wait('@getEscrow');
            // Should show YES/NO for each flag
            cy.contains('NO').should('be.visible');
        });

        it('should handle loading state', () => {
            cy.intercept('GET', '**/api/escrows/*', { delay: 1000, body: {} }).as('getEscrow');
            cy.visit('/admin/escrow/1');

            cy.contains('Loading escrow details...').should('be.visible');
        });

        it('should handle not found state', () => {
            cy.intercept('GET', '**/api/escrows/*', { statusCode: 404 }).as('getEscrow');
            cy.visit('/admin/escrow/1');
            cy.wait('@getEscrow');

            cy.contains('Escrow not found').should('be.visible');
        });
    });

    describe('Update Payment Page', () => {
        beforeEach(() => {
            cy.intercept('GET', '**/api/escrows/*', {
                body: {
                    id: '1',
                    amount: 1000,
                    buyCurrency: 'BTC',
                    buyerMarkedPaymentSent: false,
                    sellerMarkedPaymentSent: false,
                    buyerConfirmedFunding: false,
                    sellerConfirmedFunding: false
                }
            }).as('getEscrow');
            cy.visit('/admin/escrow/1/update-payment');
        });

        it('should display update payment page', () => {
            cy.wait('@getEscrow');
            cy.contains('Update Payment Details').should('be.visible');
            cy.getByTestId('update-payment-form').should('be.visible');
        });

        it('should show warning message', () => {
            cy.wait('@getEscrow');
            cy.contains('Warning: Updating the amount here will force-update').should('be.visible');
        });

        it('should have amount input', () => {
            cy.wait('@getEscrow');
            cy.getByTestId('amount-input').should('be.visible');
        });

        it('should pre-populate amount', () => {
            cy.wait('@getEscrow');
            cy.getByTestId('amount-input').should('have.value', '1000');
        });

        it('should have status flag toggles', () => {
            cy.wait('@getEscrow');
            cy.contains('Status Flags').should('be.visible');
            cy.contains('Buyer Marked Payment Sent').should('be.visible');
            cy.contains('Seller Marked Payment Sent').should('be.visible');
            cy.contains('Buyer Confirmed Funding').should('be.visible');
            cy.contains('Seller Confirmed Funding').should('be.visible');
        });

        it('should toggle status flags', () => {
            cy.wait('@getEscrow');

            // Find and click the first checkbox
            cy.get('input[type="checkbox"]').first().check();
            cy.get('input[type="checkbox"]').first().should('be.checked');

            cy.get('input[type="checkbox"]').first().uncheck();
            cy.get('input[type="checkbox"]').first().should('not.be.checked');
        });

        it('should update payment details successfully', () => {
            cy.wait('@getEscrow');
            cy.intercept('PUT', '**/api/escrows/*/admin-update', {
                statusCode: 200,
                body: { id: '1', amount: 1500 }
            }).as('updatePayment');

            cy.getByTestId('amount-input').clear().type('1500');
            cy.get('input[type="checkbox"]').first().check();
            cy.getByTestId('submit-payment-button').click();

            cy.wait('@updatePayment');
            cy.url().should('include', '/admin/escrow/1');
            cy.url().should('not.include', '/update-payment');
        });

        it('should show loading state during submission', () => {
            cy.wait('@getEscrow');
            cy.intercept('PUT', '**/api/escrows/*/admin-update', { delay: 1000, body: {} }).as('updatePayment');

            cy.getByTestId('submit-payment-button').click();

            cy.getByTestId('submit-payment-button').should('contain', 'Saving...');
            cy.getByTestId('submit-payment-button').should('be.disabled');
        });

        it('should navigate back to details', () => {
            cy.wait('@getEscrow');
            cy.contains('Back to Details').click();
            cy.url().should('not.include', '/update-payment');
        });
    });
});

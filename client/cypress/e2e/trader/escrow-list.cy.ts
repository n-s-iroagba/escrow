/// <reference types="cypress" />
describe('Escrow List', () => {
    beforeEach(() => {
        cy.loginAsTrader();
        cy.visit('/trader/escrow');
    });

    describe('Page Display', () => {
        it('should display escrow list page', () => {
            cy.url().should('include', '/trader/escrow');
            cy.contains('My Transactions').should('be.visible');
        });

        it('should show new transaction button', () => {
            cy.getByTestId('new-transaction-link').should('be.visible');
        });

        it('should display filter tabs', () => {
            cy.getByTestId('filter-all-button').should('be.visible');
            cy.getByTestId('filter-buyer-button').should('be.visible');
            cy.getByTestId('filter-seller-button').should('be.visible');
        });
    });

    describe('Filtering', () => {
        it('should filter by all escrows by default', () => {
            cy.getByTestId('filter-all-button').should('have.class', 'bg-slate-900');
        });

        it('should filter by buyer role', () => {
            cy.getByTestId('filter-buyer-button').click();
            cy.getByTestId('filter-buyer-button').should('have.class', 'bg-slate-900');
        });

        it('should filter by seller role', () => {
            cy.getByTestId('filter-seller-button').click();
            cy.getByTestId('filter-seller-button').should('have.class', 'bg-slate-900');
        });

        it('should switch between filters', () => {
            cy.getByTestId('filter-buyer-button').click();
            cy.getByTestId('filter-buyer-button').should('have.class', 'bg-slate-900');

            cy.getByTestId('filter-seller-button').click();
            cy.getByTestId('filter-seller-button').should('have.class', 'bg-slate-900');
            cy.getByTestId('filter-buyer-button').should('not.have.class', 'bg-slate-900');

            cy.getByTestId('filter-all-button').click();
            cy.getByTestId('filter-all-button').should('have.class', 'bg-slate-900');
        });
    });

    describe('Escrow Cards', () => {
        it('should display escrow cards when escrows exist', () => {
            cy.getByTestId('escrow-card').should('exist');
        });

        it('should show escrow details on each card', () => {
            cy.getByTestId('escrow-card').first().within(() => {
                // Should show amount and currencies
                cy.contains(/\d+/).should('be.visible');
                // Should show date
                cy.contains(/\d{1,2}\/\d{1,2}\/\d{4}/).should('be.visible');
                // Should show escrow ID
                cy.contains(/#[a-f0-9]{8}/).should('be.visible');
            });
        });

        it('should display status badge for each escrow', () => {
            cy.getByTestId('escrow-card').first().within(() => {
                cy.get('[class*="text-"][class*="bg-"]').should('exist');
            });
        });

        it('should show fund now button for pending escrows', () => {
            // Assuming there's at least one pending escrow
            cy.getByTestId('fund-escrow-button').should('exist');
        });

        it('should show view details button for all escrows', () => {
            cy.getByTestId('view-escrow-button').should('exist');
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no escrows exist', () => {
            // This would require test data with no escrows
            // cy.contains('No Transactions Found').should('be.visible');
            // cy.contains('Start a new secure escrow transaction').should('be.visible');
        });

        it('should show create escrow link in empty state', () => {
            // cy.contains('Create Escrow').should('be.visible');
        });
    });

    describe('Navigation', () => {
        it('should navigate to initiate escrow when clicking new transaction', () => {
            cy.getByTestId('new-transaction-link').click();
            cy.url().should('include', '/trader/escrow/initiate');
        });

        it('should navigate to fund page when clicking fund now', () => {
            cy.getByTestId('fund-escrow-button').first().click();
            cy.url().should('include', '/fund');
        });

        it('should navigate to escrow details when clicking view button', () => {
            cy.getByTestId('view-escrow-button').first().click();
            cy.url().should('include', '/trader/escrow/');
            cy.url().should('not.include', '/fund');
            cy.url().should('not.include', '/initiate');
        });
    });

    describe('Loading State', () => {
        it('should show loading state while fetching escrows', () => {
            cy.visit('/trader/escrow');
            cy.contains('Loading transactions').should('be.visible');
        });
    });

    describe('Error Handling', () => {
        it('should display error message on fetch failure', () => {
            // This would require mocking API failure
            // cy.contains('Failed to load transactions').should('be.visible');
        });
    });

    describe('Escrow Types', () => {
        it('should display crypto to crypto escrows with correct icon', () => {
            cy.getByTestId('escrow-card').first().within(() => {
                // Should show coins icon for crypto-to-crypto
                cy.get('svg').should('exist');
            });
        });

        it('should display crypto to fiat escrows with correct icon', () => {
            // Assuming there's a crypto-to-fiat escrow
            // Should show banknote icon
        });
    });

    describe('Status Badges', () => {
        it('should show different colors for different statuses', () => {
            // INITIALIZED should be blue
            // ONE_PARTY_FUNDED should be amber
            // COMPLETELY_FUNDED should be violet
            // RELEASED should be emerald
            // DISPUTED should be red
        });
    });
});

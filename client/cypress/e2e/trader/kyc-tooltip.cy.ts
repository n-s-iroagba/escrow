/// <reference types="cypress" />

describe('Trader Dashboard - KYC Tooltip', () => {
    beforeEach(() => {
        // Setup intercepts before login to ensure they catch early requests
        cy.intercept('GET', '/api/escrow/my-escrows', { fixture: 'escrows' }).as('getEscrows');
    });

    it('should show tooltip and disable fund button when user is NOT verified', () => {
        // Mock KYC status as NOT_STARTED
        cy.intercept('GET', '/api/kyc/status/*', {
            statusCode: 200,
            body: { status: 'NOT_STARTED' }
        }).as('getKycStatusUnverified');

        cy.loginAsTrader();
        cy.visit('/trader/dashboard');

        // Wait for data to load
        cy.wait(['@getKycStatusUnverified']);

        // Check button state
        cy.getByTestId('fund-now-button').first().should('be.disabled');
        cy.getByTestId('fund-now-button').first().should('have.class', 'cursor-not-allowed');

        // Check tooltip (might need to force hover or just check existence in DOM if strictly conditionally rendered)
        // In the code: {!isVerified && ( <div ...> ... </div> )}
        // It is rendered when !isVerified.

        cy.contains('Please complete your KYC verification to proceed.').should('exist');

        // Improve check by forcing the hover state if needed, but presence check is a good start since it's in the DOM
        cy.get('.group\\/tooltip').first().trigger('mouseover');
        cy.contains('Please complete your KYC verification to proceed.').should('be.visible');
    });

    it('should enable fund button when user IS verified', () => {
        // Mock KYC status as VERIFIED
        cy.intercept('GET', '/api/kyc/status/*', {
            statusCode: 200,
            body: { status: 'VERIFIED' } // or 'APPROVED'
        }).as('getKycStatusVerified');

        cy.loginAsTrader();
        cy.visit('/trader/dashboard');

        // Wait for data to load
        cy.wait(['@getKycStatusVerified']);

        // Check button state
        cy.getByTestId('fund-now-button').first().should('not.be.disabled');
        cy.getByTestId('fund-now-button').first().should('not.have.class', 'cursor-not-allowed');

        // Tooltip should not exist
        cy.contains('Please complete your KYC verification to proceed.').should('not.exist');
    });
});

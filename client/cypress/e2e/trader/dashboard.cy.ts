/// <reference types="cypress" />
describe('Trader Dashboard', () => {
    beforeEach(() => {
        cy.loginAsTrader();
        cy.visit('/trader/dashboard');
    });

    it('should display dashboard with user information', () => {
        cy.url().should('include', '/trader/dashboard');
        cy.contains('Welcome back').should('be.visible');
    });

    it('should show KYC verification alert when not verified', () => {
        // Assuming test user is not KYC verified
        cy.contains('Complete Identity Verification').should('be.visible');
        cy.getByTestId('verify-kyc-button').should('be.visible');
    });

    it('should navigate to KYC page when clicking verify button', () => {
        cy.getByTestId('verify-kyc-button').click();
        cy.url().should('include', '/trader/kyc');
    });

    it('should disable new transaction button when not verified', () => {
        // Assuming test user is not KYC verified
        cy.getByTestId('new-transaction-button').should('be.disabled');
    });

    it('should display stat cards with correct data', () => {
        cy.contains('Pending').should('be.visible');
        cy.contains('Completed').should('be.visible');
        cy.contains('Total Trades').should('be.visible');
        cy.contains('Volume').should('be.visible');
    });

    it('should show action required section', () => {
        cy.contains('Action Required').should('be.visible');
    });

    it('should display recent activity table', () => {
        cy.getByTestId('recent-activity-table').should('be.visible');
    });

    it('should navigate to escrow details when clicking on a row', () => {
        cy.getByTestId('escrow-row-0').click();
        cy.url().should('include', '/trader/escrow/');
    });

    it('should navigate to all escrows when clicking view all', () => {
        cy.getByTestId('view-all-escrows-link').click();
        cy.url().should('include', '/trader/escrow');
    });

    it('should navigate to fund page when clicking fund now button', () => {
        // Assuming there's a pending escrow
        cy.getByTestId('fund-now-button').first().click();
        cy.url().should('include', '/fund');
    });

    it('should display trust center with verification status', () => {
        cy.contains('Trust Center').should('be.visible');
        cy.contains('Identity (KYC)').should('be.visible');
        cy.contains('Email').should('be.visible');
        cy.contains('Security').should('be.visible');
    });

    it('should logout when clicking logout button', () => {
        cy.getByTestId('logout-button').click();
        cy.url().should('include', '/auth/login');
    });

    it('should display quick stats sidebar', () => {
        cy.contains('Quick Stats').should('be.visible');
        cy.contains('Total Trades').should('be.visible');
    });

    it('should show empty state when no pending actions', () => {
        // Assuming no pending escrows
        cy.contains('All Caught Up!').should('be.visible');
    });

    it('should display correct escrow count in action required badge', () => {
        // Assuming there are pending escrows
        cy.contains('Action Required').parent().within(() => {
            cy.contains(/\d+ item\(s\)/).should('be.visible');
        });
    });
});

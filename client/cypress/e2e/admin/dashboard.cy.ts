/// <reference types="cypress" />
describe('Admin Dashboard', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
        cy.visit('/admin/dashboard');
    });

    describe('Page Display', () => {
        it('should display admin dashboard with sidebar', () => {
            cy.contains('Dashboard').should('be.visible');
            cy.contains('Admin Portal').should('be.visible');
        });

        it('should display navigation items', () => {
            cy.contains('Overview').should('be.visible');
            cy.contains('Escrows').should('be.visible');
            cy.contains('Banks').should('be.visible');
            cy.contains('Wallets').should('be.visible');
            cy.contains('Users').should('be.visible');
        });

        it('should show system health indicator', () => {
            cy.contains('System Health').should('be.visible');
            cy.contains('All systems operational').should('be.visible');
        });
    });

    describe('Statistics Cards', () => {
        it('should display all stat cards', () => {
            cy.contains('Total Users').should('be.visible');
            cy.contains('Active Escrows').should('be.visible');
            cy.contains('Total Volume').should('be.visible');
            cy.contains('Completed').should('be.visible');
        });

        it('should show stat values and trends', () => {
            // Check that stat cards have values
            cy.get('.text-slate-900').should('have.length.greaterThan', 0);
        });
    });

    describe('Recent Escrows Table', () => {
        it('should display recent escrows table', () => {
            cy.getByTestId('recent-escrows-table').should('be.visible');
        });

        it('should show table headers', () => {
            cy.getByTestId('recent-escrows-table').within(() => {
                cy.contains('ID').should('be.visible');
                cy.contains('Amount').should('be.visible');
                cy.contains('Type').should('be.visible');
                cy.contains('Status').should('be.visible');
                cy.contains('Date').should('be.visible');
            });
        });

        it('should navigate to escrow details on row click', () => {
            cy.getByTestId('recent-escrows-table').find('tbody tr').first().click();
            cy.url().should('include', '/admin/escrow/');
        });
    });

    describe('Actions', () => {
        it('should have new escrow button', () => {
            cy.getByTestId('new-escrow-button').should('be.visible');
            cy.getByTestId('new-escrow-button').should('contain', 'New Escrow');
        });

        it('should navigate to escrow initiation', () => {
            cy.getByTestId('new-escrow-button').click();
            cy.url().should('include', '/trader/escrow/initiate');
        });

        it('should have view all escrows link', () => {
            cy.getByTestId('view-all-escrows-link').should('be.visible');
            cy.getByTestId('view-all-escrows-link').should('contain', 'View All');
        });

        it('should navigate to escrow list', () => {
            cy.getByTestId('view-all-escrows-link').click();
            cy.url().should('include', '/admin/escrow');
        });
    });

    describe('Navigation', () => {
        it('should navigate to escrow management', () => {
            cy.contains('Escrows').click();
            cy.url().should('include', '/admin/escrow');
        });

        it('should navigate to bank management', () => {
            cy.contains('Banks').click();
            cy.url().should('include', '/admin/bank');
        });

        it('should navigate to wallet management', () => {
            cy.contains('Wallets').click();
            cy.url().should('include', '/admin/custodial-wallet');
        });
    });

    describe('Loading States', () => {
        it('should handle loading state gracefully', () => {
            cy.intercept('GET', '**/api/users', { delay: 1000, body: [] }).as('getUsers');
            cy.visit('/admin/dashboard');
            // Should not crash during loading
            cy.contains('Dashboard').should('be.visible');
        });
    });
});

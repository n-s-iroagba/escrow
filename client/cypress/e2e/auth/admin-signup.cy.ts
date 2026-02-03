/// <reference types="cypress" />
describe('Admin Sign Up Flow', () => {
    beforeEach(() => {
        cy.visit('/auth/sign-up/admin');
    });

    it('should display admin sign up form', () => {
        cy.getByTestId('admin-signup-form').should('be.visible');
        cy.getByTestId('email-input').should('be.visible');
        cy.getByTestId('password-input').should('be.visible');
        cy.getByTestId('confirm-password-input').should('be.visible');
        cy.getByTestId('admin-signup-button').should('be.visible');
    });

    it('should display warning banner for authorized personnel', () => {
        cy.contains('Authorized personnel only').should('be.visible');
    });

    it('should validate password match', () => {
        cy.getByTestId('email-input').type('admin@organization.com');
        cy.getByTestId('password-input').type('AdminPass123!');
        cy.getByTestId('confirm-password-input').type('DifferentPass123!');
        cy.getByTestId('admin-signup-button').click();

        cy.on('window:alert', (text: any) => {
            expect(text).to.contains('do not match');
        });
    });

    it('should successfully create admin account', () => {
        cy.getByTestId('email-input').type('newadmin@organization.com');
        cy.getByTestId('password-input').type('AdminPass123!');
        cy.getByTestId('confirm-password-input').type('AdminPass123!');
        cy.getByTestId('admin-signup-button').click();

        // Should redirect to email verification
        cy.url().should('include', '/auth/verify-email');
    });

    it('should navigate back to login', () => {
        cy.getByTestId('login-link').click();
        cy.url().should('include', '/auth/login');
    });

    it('should show error for duplicate admin email', () => {
        cy.fixture('users').then((users: any) => {
            cy.getByTestId('email-input').type(users.admin.email);
            cy.getByTestId('password-input').type('AdminPass123!');
            cy.getByTestId('confirm-password-input').type('AdminPass123!');
            cy.getByTestId('admin-signup-button').click();

            cy.getByTestId('error-message').should('be.visible');
        });
    });

    it('should validate email format', () => {
        cy.getByTestId('email-input').type('invalid-email');
        cy.getByTestId('password-input').type('AdminPass123!');
        cy.getByTestId('confirm-password-input').type('AdminPass123!');
        cy.getByTestId('admin-signup-button').click();

        cy.getByTestId('email-input').then(($input: any) => {
            expect($input[0].validationMessage).to.not.be.empty;
        });
    });
});

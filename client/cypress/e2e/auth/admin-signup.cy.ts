/// <reference types="cypress" />
describe('Admin Sign Up Flow', () => {
    beforeEach(() => {
        cy.visit('/auth/sign-up/admin');
    });

    it('should display admin sign up form', () => {
        cy.getByTestId('admin-signup-form').should('be.visible');
        cy.getByTestId('email-input').should('be.visible');
        cy.getByTestId('username-input').should('be.visible');
        cy.getByTestId('password-input').should('be.visible');
        cy.getByTestId('confirm-password-input').should('be.visible');
        cy.getByTestId('admin-signup-button').should('be.visible');
    });

    it('should display warning banner for authorized personnel', () => {
        cy.contains('Authorized personnel only').should('be.visible');
    });

    it('should validate password match', () => {
        cy.getByTestId('email-input').type('admin@organization.com');
        cy.getByTestId('username-input').type('admin_test');
        cy.getByTestId('password-input').type('AdminPass123!');
        cy.getByTestId('confirm-password-input').type('DifferentPass123!');
        cy.getByTestId('admin-signup-button').click();

        cy.on('window:alert', (text: any) => {
            expect(text).to.contains('do not match');
        });
    });

    it('should successfully create admin account', () => {
        const timestamp = Date.now();
        cy.getByTestId('email-input').type(`newadmin${timestamp}@organization.com`);
        cy.getByTestId('username-input').type(`admin_${timestamp}`);
        cy.getByTestId('password-input').type('AdminPass123!');
        cy.getByTestId('confirm-password-input').type('AdminPass123!');
        cy.getByTestId('admin-signup-button').click();

        // Should redirect to email verification with token (123456 in dev)
        cy.url().should('include', '/auth/verify-email/123456');
    });

    it('should navigate back to login', () => {
        cy.getByTestId('login-link').click();
        cy.url().should('include', '/auth/login');
    });

    it('should show error for duplicate admin email', () => {
        cy.fixture('users').then((users: any) => {
            cy.getByTestId('email-input').type(users.admin.email);
            cy.getByTestId('username-input').type('unique_username_123');
            cy.getByTestId('password-input').type('AdminPass123!');
            cy.getByTestId('confirm-password-input').type('AdminPass123!');
            cy.getByTestId('admin-signup-button').click();

            cy.getByTestId('error-message').should('be.visible')
                .and('contain', 'user with this email already exists');
        });
    });

    it('should validate email format', () => {
        cy.getByTestId('email-input').type('invalid-email');
        cy.getByTestId('username-input').type('test_username');
        cy.getByTestId('password-input').type('AdminPass123!');
        cy.getByTestId('confirm-password-input').type('AdminPass123!');
        cy.getByTestId('admin-signup-button').click();

        cy.getByTestId('email-input').then(($input: any) => {
            expect($input[0].validationMessage).to.not.be.empty;
        });
    });

    it('should validate username format and length', () => {
        cy.getByTestId('email-input').type('admin@organization.com');
        cy.getByTestId('username-input').type('ab'); // Too short (min 3 chars)
        cy.getByTestId('password-input').type('AdminPass123!');
        cy.getByTestId('confirm-password-input').type('AdminPass123!');
        cy.getByTestId('admin-signup-button').click();

        cy.getByTestId('username-input').then(($input: any) => {
            expect($input[0].checkValidity()).to.be.false;
        });
    });
});

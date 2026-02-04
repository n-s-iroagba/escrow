/// <reference types="cypress" />
describe('Sign Up Flow', () => {
    beforeEach(() => {
        cy.visit('/auth/sign-up');
    });

    it('should display sign up form', () => {
        cy.getByTestId('signup-form').should('be.visible');
        cy.getByTestId('username-input').should('be.visible');
        cy.getByTestId('email-input').should('be.visible');
        cy.getByTestId('password-input').should('be.visible');
        cy.getByTestId('confirm-password-input').should('be.visible');
        cy.getByTestId('terms-checkbox').should('be.visible');
        cy.getByTestId('signup-button').should('be.visible');
    });

    it('should validate password requirements', () => {
        cy.getByTestId('email-input').type('newuser@test.com');
        cy.getByTestId('username-input').type('newuser');

        // Test short password
        cy.getByTestId('password-input').type('short');
        cy.getByTestId('signup-button').should('be.disabled');

        // Test password without number/symbol
        cy.getByTestId('password-input').clear().type('longpassword');
        cy.getByTestId('signup-button').should('be.disabled');

        // Test valid password
        cy.getByTestId('password-input').clear().type('ValidPass123!');
        cy.getByTestId('confirm-password-input').type('ValidPass123!');
        cy.getByTestId('terms-checkbox').check();
        cy.getByTestId('signup-button').should('not.be.disabled');
    });

    it('should show error for mismatched passwords', () => {
        cy.getByTestId('email-input').type('newuser@test.com');
        cy.getByTestId('username-input').type('newuser');
        cy.getByTestId('password-input').type('ValidPass123!');
        cy.getByTestId('confirm-password-input').type('DifferentPass123!');
        cy.getByTestId('terms-checkbox').check();
        cy.getByTestId('signup-button').click();

        // Alert should appear (in real implementation, this would be a proper error message)
        cy.on('window:alert', (text: any) => {
            expect(text).to.contains('do not match');
        });
    });

    it('should require terms acceptance', () => {
        cy.getByTestId('email-input').type('newuser@test.com');
        cy.getByTestId('username-input').type('newuser');
        cy.getByTestId('password-input').type('ValidPass123!');
        cy.getByTestId('confirm-password-input').type('ValidPass123!');

        // Button should be disabled without terms
        cy.getByTestId('signup-button').should('be.disabled');

        // Enable after checking terms
        cy.getByTestId('terms-checkbox').check();
        cy.getByTestId('signup-button').should('not.be.disabled');
    });

    it('should successfully register a new user', () => {
        // Use unique email/username to avoid conflict with seed
        const timestamp = Date.now();
        cy.getByTestId('email-input').type(`trader${timestamp}@test.com`);
        cy.getByTestId('username-input').type(`trader_${timestamp}`);
        cy.getByTestId('password-input').type('UserPass123!');
        cy.getByTestId('confirm-password-input').type('UserPass123!');
        cy.getByTestId('terms-checkbox').check();
        cy.getByTestId('signup-button').click();

        // Should redirect to email verification
        cy.url().should('include', '/auth/verify-email/123456');
    });

    it('should navigate to login page', () => {
        cy.getByTestId('login-link').click();
        cy.url().should('include', '/auth/login');
    });

    it('should show error for duplicate email', () => {
        cy.fixture('users').then((users: any) => {
            // Using seed user that definitely exists
            cy.getByTestId('email-input').type('trader@greenwealth.com');
            cy.getByTestId('username-input').type('unique_trader_user');
            cy.getByTestId('password-input').type('ValidPass123!');
            cy.getByTestId('confirm-password-input').type('ValidPass123!');
            cy.getByTestId('terms-checkbox').check();
            cy.getByTestId('signup-button').click();

            cy.getByTestId('error-message').should('be.visible')
                .and('contain', 'user with this email already exists');
        });
    });
});

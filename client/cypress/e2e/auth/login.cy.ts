/// <reference types="cypress" />
describe('Login Flow', () => {
    beforeEach(() => {
        cy.visit('/auth/login');
    });

    it('should display login form', () => {
        cy.getByTestId('login-form').should('be.visible');
        cy.getByTestId('email-input').should('be.visible');
        cy.getByTestId('password-input').should('be.visible');
        cy.getByTestId('login-button').should('be.visible');
    });

    it('should show error message for invalid credentials', () => {
        cy.getByTestId('email-input').type('invalid@test.com');
        cy.getByTestId('password-input').type('wrongpassword');
        cy.getByTestId('login-button').click();

        cy.getByTestId('error-message').should('be.visible');
    });

    it('should successfully login as trader and redirect to trader dashboard', () => {
        cy.fixture('users').then((users: any) => {
            cy.getByTestId('email-input').type(users.trader.email);
            cy.getByTestId('password-input').type(users.trader.password);
            cy.getByTestId('login-button').click();

            cy.url().should('include', '/trader/dashboard');
        });
    });

    it('should successfully login as admin and redirect to admin dashboard', () => {
        cy.fixture('users').then((users: any) => {
            cy.getByTestId('email-input').type(users.admin.email);
            cy.getByTestId('password-input').type(users.admin.password);
            cy.getByTestId('login-button').click();

            cy.url().should('include', '/admin/dashboard');
        });
    });

    it('should toggle password visibility', () => {
        cy.getByTestId('password-input').should('have.attr', 'type', 'password');
        cy.getByTestId('toggle-password-button').click();
        cy.getByTestId('password-input').should('have.attr', 'type', 'text');
    });

    it('should navigate to forgot password page', () => {
        cy.getByTestId('forgot-password-link').click();
        cy.url().should('include', '/auth/forgot-password');
    });

    it('should navigate to sign up page', () => {
        cy.getByTestId('signup-link').click();
        cy.url().should('include', '/auth/sign-up');
    });

    it('should validate required fields', () => {
        cy.getByTestId('login-button').click();

        cy.getByTestId('email-input').then(($input: any) => {
            expect($input[0].validationMessage).to.not.be.empty;
        });
    });
});

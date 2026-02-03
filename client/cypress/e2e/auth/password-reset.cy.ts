/// <reference types="cypress" />
describe('Password Reset Flow', () => {
    describe('Forgot Password', () => {
        beforeEach(() => {
            cy.visit('/auth/forgot-password');
        });

        it('should display forgot password form', () => {
            cy.getByTestId('forgot-password-form').should('be.visible');
            cy.getByTestId('email-input').should('be.visible');
            cy.getByTestId('reset-password-button').should('be.visible');
        });

        it('should send password reset email', () => {
            cy.fixture('users').then((users: any) => {
                cy.getByTestId('email-input').type(users.trader.email);
                cy.getByTestId('reset-password-button').click();

                // Should show success message
                cy.contains('Check your inbox').should('be.visible');
            });
        });

        it('should navigate back to login', () => {
            cy.getByTestId('back-to-login-link').click();
            cy.url().should('include', '/auth/login');
        });

        it('should validate email format', () => {
            cy.getByTestId('email-input').type('invalid-email');
            cy.getByTestId('reset-password-button').click();

            cy.getByTestId('email-input').then(($input: any) => {
                expect($input[0].validationMessage).to.not.be.empty;
            });
        });
    });

    describe('Reset Password', () => {
        const validToken = 'valid-reset-token-123';

        beforeEach(() => {
            cy.visit(`/auth/reset-password/${validToken}`);
        });

        it('should display reset password form', () => {
            cy.getByTestId('reset-password-form').should('be.visible');
            cy.getByTestId('new-password-input').should('be.visible');
            cy.getByTestId('confirm-password-input').should('be.visible');
            cy.getByTestId('reset-password-button').should('be.visible');
        });

        it('should validate password match', () => {
            cy.getByTestId('new-password-input').type('NewPassword123!');
            cy.getByTestId('confirm-password-input').type('DifferentPass123!');
            cy.getByTestId('reset-password-button').click();

            cy.on('window:alert', (text: any) => {
                expect(text).to.contains('do not match');
            });
        });

        it('should successfully reset password', () => {
            cy.getByTestId('new-password-input').type('NewPassword123!');
            cy.getByTestId('confirm-password-input').type('NewPassword123!');
            cy.getByTestId('reset-password-button').click();

            // Should show success alert and redirect to login
            cy.on('window:alert', (text: any) => {
                expect(text).to.contains('successfully');
            });

            cy.url().should('include', '/auth/login');
        });

        it('should show error for invalid token', () => {
            cy.visit('/auth/reset-password/invalid-token');

            cy.getByTestId('new-password-input').type('NewPassword123!');
            cy.getByTestId('confirm-password-input').type('NewPassword123!');
            cy.getByTestId('reset-password-button').click();

            cy.getByTestId('error-message').should('be.visible');
        });
    });
});

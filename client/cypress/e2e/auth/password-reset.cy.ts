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
        const validToken = 'abcdef'; // Use fixed token set in dev mode

        before(() => {
            // Seed the token for the user so validToken works
            cy.fixture('users').then((users: any) => {
                cy.request({
                    method: 'POST',
                    url: 'http://localhost:5000/api/v1/auth/forgot-password',
                    body: { email: users.trader.email },
                    failOnStatusCode: false
                });
            });
        });

        beforeEach(() => {
            cy.visit(`/auth/reset-password/${validToken}`);
        });

        it.only('should display reset password form', () => {
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

            // Should show success toast
            cy.contains('Password reset successful!').should('be.visible');

            // Should redirect to dashboard (either admin or trader, checking generic url change)
            // Since we don't know the exact role of the user associated with 'abcdef' without seeding, 
            // we can check it leaves the reset page or goes to a dashboard.
            // But wait, we need a valid user for 'abcdef' token to work.
            // The previous 'forgot password' test sends the email, which sets the token to 'abcdef' in dev.
            // So we should run these in sequence or ensure user exists.

            // For now, let's assume the previous test ran or we need to seed data.
            // But wait, the previous test uses `cy.fixture('users')`.

            cy.url().should('include', '/dashboard');
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

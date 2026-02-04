/// <reference types="cypress" />

describe('Invite Sign Up Flow', () => {
    const testEmail = 'invited_user@example.com';
    const encodedEmail = encodeURIComponent(testEmail);

    beforeEach(() => {
        cy.visit(`/auth/sign-up/invite/${encodedEmail}`);
    });

    it('should display invite sign up form with pre-filled email', () => {
        cy.getByTestId('invite-signup-form').should('be.visible');

        // Email should be pre-filled and readonly
        cy.getByTestId('email-input')
            .should('be.visible')
            .should('have.value', testEmail)
            .should('have.attr', 'readonly');

        cy.getByTestId('username-input').should('be.visible');
        cy.getByTestId('password-input').should('be.visible');
        cy.getByTestId('confirm-password-input').should('be.visible');
        cy.getByTestId('terms-checkbox').should('be.visible');
        cy.getByTestId('signup-button').should('be.visible');
    });

    it('should successfully register invited user (auto-verified)', () => {
        const timestamp = Date.now();
        // Username must be unique
        cy.getByTestId('username-input').type(`invited_${timestamp}`);
        cy.getByTestId('password-input').type('UserPass123!');
        cy.getByTestId('confirm-password-input').type('UserPass123!');
        cy.getByTestId('terms-checkbox').check();

        // Intercept the register request to simulate backend returning auto-verified = true
        // This avoids needing to seed an actual escrow in the DB for this frontend test
        cy.intercept('POST', '**/api/v1/auth/register', {
            statusCode: 201,
            body: {
                success: true,
                data: {
                    id: 'mock-id',
                    email: testEmail,
                    username: `invited_${timestamp}`,
                    emailVerified: true,
                    role: 'CLIENT'
                },
                message: 'Registration successful. Welcome aboard!'
            }
        }).as('registerInvitedUser');

        // Email field should not be editable but form should submit successfully
        cy.getByTestId('signup-button').click();

        cy.wait('@registerInvitedUser');

        // Should redirect to dashboard for invited/auto-verified users
        cy.url().should('include', '/dashboard');
    });

    it('should show error if invited email is already registered', () => {
        // Use an existing email from fixtures
        cy.fixture('users').then((users: any) => {
            const existingEmail = users.trader.email;
            cy.visit(`/auth/sign-up/invite/${encodeURIComponent(existingEmail)}`);

            cy.getByTestId('username-input').type('unique_user_999');
            cy.getByTestId('password-input').type('ValidPass123!');
            cy.getByTestId('confirm-password-input').type('ValidPass123!');
            cy.getByTestId('terms-checkbox').check();
            cy.getByTestId('signup-button').click();

            cy.getByTestId('error-message').should('be.visible')
                .and('contain', 'user with this email already exists');
        });
    });
});

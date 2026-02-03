/// <reference types="cypress" />

// @ts-nocheck
// Custom commands will be available once Cypress is installed

// Type declarations only - actual implementations will work when Cypress is installed
declare global {
    namespace Cypress {
        interface Chainable {
            getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
            login(email: string, password: string): Chainable<void>;
            loginAsTrader(): Chainable<void>;
            loginAsAdmin(): Chainable<void>;
            logout(): Chainable<void>;
            fillForm(formData: Record<string, string>): Chainable<void>;
        }
    }
}

// These will be properly registered when Cypress is installed
// @ts-ignore
if (typeof Cypress !== 'undefined' && Cypress.Commands) {
    Cypress.Commands.add('getByTestId', (testId: string) => {
        return cy.get(`[data-testid="${testId}"]`);
    });

    Cypress.Commands.add('login', (email: string, password: string) => {
        cy.visit('/auth/login');
        cy.getByTestId('email-input').type(email);
        cy.getByTestId('password-input').type(password);
        cy.getByTestId('login-button').click();
        cy.url().should('not.include', '/auth/login');
    });

    Cypress.Commands.add('loginAsTrader', () => {
        cy.fixture('users').then((users: any) => {
            cy.login(users.trader.email, users.trader.password);
        });
    });

    Cypress.Commands.add('loginAsAdmin', () => {
        cy.fixture('users').then((users: any) => {
            cy.login(users.admin.email, users.admin.password);
        });
    });

    Cypress.Commands.add('logout', () => {
        cy.getByTestId('logout-button').click();
        cy.url().should('include', '/auth/login');
    });

    Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
        Object.entries(formData).forEach(([key, value]) => {
            cy.getByTestId(`${key}-input`).clear().type(value);
        });
    });
}

export { };

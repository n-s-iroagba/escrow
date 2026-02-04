// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Prevent TypeScript errors
declare global {
    namespace Cypress {
        interface Chainable {
            login(email: string, password: string): Chainable<void>;
            loginAsTrader(): Chainable<void>;
            loginAsAdmin(): Chainable<void>;
            logout(): Chainable<void>;
            getByTestId(testId: string): Chainable<any>;
            fillForm(formData: Record<string, string>): Chainable<void>;
        }
    }
}

// Global before hook
beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();

    // Capture console logs during tests
    cy.window().then((win: any) => {
        cy.spy(win.console, 'log').as('consoleLog');
        cy.spy(win.console, 'error').as('consoleError');
        cy.spy(win.console, 'warn').as('consoleWarn');
    });
});

// Global after hook
// @ts-ignore - Using function context for Mocha
afterEach(function () {
    // Log test outcome
    const testState = (this as any).currentTest?.state || 'unknown';
    const testTitle = (this as any).currentTest?.fullTitle() || 'Unknown test';

    cy.task('log', `Test "${testTitle}" - ${testState.toUpperCase()}`);

    // If test failed, log additional debugging info
    if (testState === 'failed') {
        cy.task('logError', {
            test: testTitle,
            state: testState,
            error: (this as any).currentTest?.err?.message || 'No error message',
            timestamp: new Date().toISOString()
        });
    }
});

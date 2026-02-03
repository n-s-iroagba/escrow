/// <reference types="cypress" />
describe('Admin Bank Management', () => {
    beforeEach(() => {
        cy.loginAsAdmin();
    });

    describe('Bank List Page', () => {
        beforeEach(() => {
            cy.visit('/admin/bank');
        });

        it('should display bank list page', () => {
            cy.contains('Bank Accounts').should('be.visible');
            cy.contains('Manage custodial fiat bank accounts').should('be.visible');
        });

        it('should have add bank button', () => {
            cy.getByTestId('add-bank-link').should('be.visible');
            cy.getByTestId('add-bank-link').should('contain', 'Add Bank');
        });

        it('should display search input', () => {
            cy.getByTestId('search-banks-input').should('be.visible');
            cy.getByTestId('search-banks-input').should('have.attr', 'placeholder', 'Search banks...');
        });

        it('should display bank cards when banks exist', () => {
            cy.intercept('GET', '**/api/banks', { fixture: 'banks.json' }).as('getBanks');
            cy.visit('/admin/bank');
            cy.wait('@getBanks');
            cy.getByTestId('bank-card').should('have.length.greaterThan', 0);
        });

        it('should show empty state when no banks', () => {
            cy.intercept('GET', '**/api/banks', { body: [] }).as('getBanks');
            cy.visit('/admin/bank');
            cy.wait('@getBanks');
            cy.contains('No Banks Configured').should('be.visible');
        });

        it('should navigate to add bank page', () => {
            cy.getByTestId('add-bank-link').click();
            cy.url().should('include', '/admin/bank/new');
        });

        it('should have view and edit buttons on bank cards', () => {
            cy.intercept('GET', '**/api/banks', { fixture: 'banks.json' }).as('getBanks');
            cy.visit('/admin/bank');
            cy.wait('@getBanks');

            cy.getByTestId('bank-card').first().within(() => {
                cy.getByTestId('view-bank-button').should('be.visible');
                cy.getByTestId('edit-bank-button').should('be.visible');
            });
        });
    });

    describe('New Bank Page', () => {
        beforeEach(() => {
            cy.visit('/admin/bank/new');
        });

        it('should display new bank form', () => {
            cy.contains('Add New Bank').should('be.visible');
            cy.getByTestId('new-bank-form').should('be.visible');
        });

        it('should have all required form fields', () => {
            cy.getByTestId('bank-name-input').should('be.visible');
            cy.getByTestId('account-number-input').should('be.visible');
            cy.getByTestId('currency-select').should('be.visible');
        });

        it('should have logo upload area', () => {
            cy.getByTestId('logo-upload-area').should('be.visible');
        });

        it('should show currency options', () => {
            cy.getByTestId('currency-select').select('USD');
            cy.getByTestId('currency-select').should('have.value', 'USD');

            cy.getByTestId('currency-select').select('EUR');
            cy.getByTestId('currency-select').should('have.value', 'EUR');
        });

        it('should validate required fields', () => {
            cy.getByTestId('submit-bank-button').click();

            // HTML5 validation should prevent submission
            cy.getByTestId('bank-name-input').then(($input: any) => {
                expect($input[0].validationMessage).to.not.be.empty;
            });
        });

        it('should submit form with valid data', () => {
            cy.intercept('POST', '**/api/banks', {
                statusCode: 201,
                body: { id: '1', name: 'Test Bank' }
            }).as('createBank');

            cy.getByTestId('bank-name-input').type('Test Bank');
            cy.getByTestId('account-number-input').type('1234567890');
            cy.getByTestId('currency-select').select('USD');
            cy.getByTestId('submit-bank-button').click();

            cy.wait('@createBank');
            cy.url().should('include', '/admin/bank');
            cy.url().should('not.include', '/new');
        });

        it('should show loading state during submission', () => {
            cy.intercept('POST', '**/api/banks', { delay: 1000, body: {} }).as('createBank');

            cy.getByTestId('bank-name-input').type('Test Bank');
            cy.getByTestId('account-number-input').type('1234567890');
            cy.getByTestId('submit-bank-button').click();

            cy.getByTestId('submit-bank-button').should('contain', 'Creating...');
            cy.getByTestId('submit-bank-button').should('be.disabled');
        });
    });

    describe('Bank Details Page', () => {
        beforeEach(() => {
            cy.intercept('GET', '**/api/banks/*', { fixture: 'banks.json' }).as('getBank');
            cy.visit('/admin/bank/1');
        });

        it('should display bank details', () => {
            cy.wait('@getBank');
            cy.contains('Bank Details').should('be.visible');
            cy.getByTestId('bank-details-container').should('be.visible');
        });

        it('should have edit bank link', () => {
            cy.wait('@getBank');
            cy.getByTestId('edit-bank-link').should('be.visible');
            cy.getByTestId('edit-bank-link').should('contain', 'Edit Bank');
        });

        it('should navigate to edit page', () => {
            cy.wait('@getBank');
            cy.getByTestId('edit-bank-link').click();
            cy.url().should('include', '/edit');
        });

        it('should display bank information', () => {
            cy.wait('@getBank');
            cy.contains('Account Number').should('be.visible');
            cy.contains('Currency').should('be.visible');
        });
    });

    describe('Edit Bank Page', () => {
        beforeEach(() => {
            cy.intercept('GET', '**/api/banks/*', {
                body: {
                    id: '1',
                    name: 'Test Bank',
                    accountNumber: '1234567890',
                    currency: 'USD'
                }
            }).as('getBank');
            cy.visit('/admin/bank/1/edit');
        });

        it('should display edit bank form', () => {
            cy.wait('@getBank');
            cy.contains('Edit Bank').should('be.visible');
            cy.getByTestId('edit-bank-form').should('be.visible');
        });

        it('should pre-populate form with existing data', () => {
            cy.wait('@getBank');
            cy.getByTestId('bank-name-input').should('have.value', 'Test Bank');
        });

        it('should update bank successfully', () => {
            cy.wait('@getBank');
            cy.intercept('PUT', '**/api/banks/*', {
                statusCode: 200,
                body: { id: '1', name: 'Updated Bank' }
            }).as('updateBank');

            cy.getByTestId('bank-name-input').clear().type('Updated Bank');
            cy.getByTestId('submit-bank-button').click();

            cy.wait('@updateBank');
            cy.url().should('include', '/admin/bank');
            cy.url().should('not.include', '/edit');
        });
    });
});

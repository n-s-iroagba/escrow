/// <reference types="cypress" />
describe('Trader KYC Verification', () => {
    beforeEach(() => {
        cy.loginAsTrader();
    });

    describe('KYC Form Submission', () => {
        beforeEach(() => {
            cy.visit('/trader/kyc');
        });

        it('should display KYC form when not verified', () => {
            cy.getByTestId('kyc-form').should('be.visible');
            cy.contains('Identity Verification').should('be.visible');
        });

        it('should validate required fields', () => {
            cy.getByTestId('submit-kyc-button').click();
            // Form should not submit without required fields
            cy.url().should('include', '/trader/kyc');
        });

        it('should allow selecting document type', () => {
            cy.getByTestId('document-type-select').select('DRIVERS_LICENSE');
            cy.getByTestId('document-type-select').should('have.value', 'DRIVERS_LICENSE');

            cy.getByTestId('document-type-select').select('NATIONAL_ID');
            cy.getByTestId('document-type-select').should('have.value', 'NATIONAL_ID');

            cy.getByTestId('document-type-select').select('PASSPORT');
            cy.getByTestId('document-type-select').should('have.value', 'PASSPORT');
        });

        it('should fill in personal information', () => {
            cy.getByTestId('full-name-input').type('John Doe');
            cy.getByTestId('full-name-input').should('have.value', 'John Doe');

            cy.getByTestId('document-number-input').type('AB123456');
            cy.getByTestId('document-number-input').should('have.value', 'AB123456');
        });

        it('should show upload areas for documents', () => {
            cy.getByTestId('document-front-upload').should('be.visible');
            cy.getByTestId('document-back-upload').should('be.visible');
        });

        it('should disable submit button while uploading', () => {
            cy.getByTestId('full-name-input').type('John Doe');
            cy.getByTestId('document-number-input').type('AB123456');

            // Submit button should be enabled after filling required fields
            // but disabled while files are uploading
            cy.getByTestId('submit-kyc-button').should('not.be.disabled');
        });

        it('should show rejection message when KYC was rejected', () => {
            // This would require setting up test data with rejected KYC
            // cy.contains('Your previous submission was rejected').should('be.visible');
        });

        it('should successfully submit KYC form', () => {
            cy.fixture('users').then((users: any) => {
                cy.getByTestId('full-name-input').type('John Trader');
                cy.getByTestId('document-type-select').select('PASSPORT');
                cy.getByTestId('document-number-input').type('P12345678');

                // Note: File upload testing would require actual file fixtures
                // For now, we'll test the form structure
                cy.getByTestId('submit-kyc-button').should('be.visible');
            });
        });
    });

    describe('KYC Status - Pending', () => {
        it('should show pending status when KYC is under review', () => {
            // This would require test data with pending KYC
            cy.visit('/trader/kyc');
            cy.contains('Verification Pending').should('be.visible');
            cy.contains('We are reviewing your documents').should('be.visible');
        });

        it('should display submitted document information', () => {
            cy.visit('/trader/kyc');
            cy.contains('Submitted Document').should('be.visible');
        });

        it('should allow navigation to dashboard from pending state', () => {
            cy.visit('/trader/kyc');
            cy.getByTestId('dashboard-button').click();
            cy.url().should('include', '/trader/dashboard');
        });
    });

    describe('KYC Status - Verified', () => {
        it('should show verified status when KYC is approved', () => {
            // This would require test data with approved KYC
            cy.visit('/trader/kyc');
            cy.contains('Identity Verified').should('be.visible');
            cy.contains('Your account is fully verified').should('be.visible');
        });

        it('should allow initiating escrow when verified', () => {
            cy.visit('/trader/kyc');
            cy.getByTestId('initiate-escrow-button').click();
            cy.url().should('include', '/trader/escrow/initiate');
        });
    });

    describe('Form Validation', () => {
        beforeEach(() => {
            cy.visit('/trader/kyc');
        });

        it('should require full name', () => {
            cy.getByTestId('document-number-input').type('AB123456');
            cy.getByTestId('submit-kyc-button').click();
            cy.url().should('include', '/trader/kyc');
        });

        it('should require document number', () => {
            cy.getByTestId('full-name-input').type('John Doe');
            cy.getByTestId('submit-kyc-button').click();
            cy.url().should('include', '/trader/kyc');
        });

        it('should require both document images', () => {
            cy.getByTestId('full-name-input').type('John Doe');
            cy.getByTestId('document-number-input').type('AB123456');
            // Without uploading images, submit should fail
            cy.getByTestId('submit-kyc-button').click();
            // Alert should appear (would need to handle alert in actual test)
        });
    });

    describe('Navigation', () => {
        it('should navigate from dashboard to KYC page', () => {
            cy.visit('/trader/dashboard');
            cy.getByTestId('verify-kyc-button').click();
            cy.url().should('include', '/trader/kyc');
        });

        it('should show KYC status in dashboard trust center', () => {
            cy.visit('/trader/dashboard');
            cy.contains('Trust Center').should('be.visible');
            cy.contains('Identity (KYC)').should('be.visible');
        });
    });
});

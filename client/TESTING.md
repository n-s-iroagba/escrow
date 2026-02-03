# Cypress E2E Testing Guide

## Overview

This project uses Cypress for end-to-end testing. The test suite covers authentication flows, admin operations, and trader workflows.

## Prerequisites

1. **Install Dependencies**
   ```bash
   cd /home/udorakpuenyi/escrow/client
   npm install
   ```

2. **Start the Backend Server**
   ```bash
   cd /home/udorakpuenyi/escrow/server
   npm run dev
   ```

3. **Start the Frontend Development Server**
   ```bash
   cd /home/udorakpuenyi/escrow/client
   npm run dev
   ```

## Running Tests

### Interactive Mode (Cypress Test Runner)
```bash
npm run cypress:open
```
This opens the Cypress Test Runner where you can select and run individual test files interactively.

### Headless Mode (CI/CD)
```bash
npm run cypress:run
```
Runs all tests in headless mode and generates video recordings.

### Run Specific Test File
```bash
npx cypress run --spec "cypress/e2e/auth/login.cy.ts"
```

## Test Structure

```
cypress/
├── e2e/                    # Test files
│   ├── auth/              # Authentication tests
│   │   ├── login.cy.ts
│   │   ├── signup.cy.ts
│   │   ├── admin-signup.cy.ts
│   │   ├── password-reset.cy.ts
│   │   └── email-verification.cy.ts
│   ├── admin/             # Admin dashboard tests (to be created)
│   ├── trader/            # Trader dashboard tests (to be created)
│   └── public/            # Public pages tests (to be created)
├── fixtures/              # Test data
│   ├── users.json
│   ├── escrows.json
│   ├── banks.json
│   └── wallets.json
└── support/               # Custom commands and utilities
    ├── commands.ts
    └── e2e.ts
```

## Custom Commands

### `cy.getByTestId(testId)`
Get element by data-testid attribute.
```typescript
cy.getByTestId('login-button').click();
```

### `cy.login(email, password)`
Login with email and password.
```typescript
cy.login('trader@test.com', 'Test123!@#');
```

### `cy.loginAsTrader()`
Login as the test trader user.
```typescript
cy.loginAsTrader();
cy.url().should('include', '/trader/dashboard');
```

### `cy.loginAsAdmin()`
Login as the test admin user.
```typescript
cy.loginAsAdmin();
cy.url().should('include', '/admin/dashboard');
```

### `cy.fillForm(formData)`
Fill form fields using test IDs.
```typescript
cy.fillForm({
  email: 'user@test.com',
  password: 'Password123!'
});
```

## Test Data

Test fixtures are located in `cypress/fixtures/`. Update these files with your test data:

- **users.json**: Test user credentials
- **escrows.json**: Sample escrow data
- **banks.json**: Sample bank information
- **wallets.json**: Sample wallet addresses

## Test ID Naming Convention

All interactive elements have `data-testid` attributes following this pattern:

- Forms: `{page}-form`
- Input fields: `{field-name}-input`
- Buttons: `{action}-button`
- Links: `{destination}-link`
- Error messages: `error-message`
- Tables: `{entity}-table`

## Completed Test Coverage

### Authentication (100%)
- ✅ Login (trader and admin)
- ✅ User registration
- ✅ Admin registration
- ✅ Forgot password
- ✅ Reset password
- ✅ Email verification

### Admin Dashboard (In Progress)
- ⏳ Dashboard overview
- ⏳ Bank management (CRUD)
- ⏳ Wallet management (CRUD)
- ⏳ Escrow monitoring

### Trader Dashboard (In Progress)
- ⏳ Dashboard overview
- ⏳ KYC submission
- ⏳ Escrow initiation
- ⏳ Escrow funding

## Writing New Tests

1. **Create test file** in appropriate directory (e.g., `cypress/e2e/trader/kyc.cy.ts`)

2. **Add test IDs** to the page components:
   ```tsx
   <input data-testid="document-upload-input" type="file" />
   <button data-testid="submit-kyc-button">Submit</button>
   ```

3. **Write tests** using custom commands:
   ```typescript
   describe('KYC Submission', () => {
     beforeEach(() => {
       cy.loginAsTrader();
       cy.visit('/trader/kyc');
     });

     it('should submit KYC documents', () => {
       cy.getByTestId('document-upload-input').attachFile('id-card.jpg');
       cy.getByTestId('submit-kyc-button').click();
       cy.contains('KYC submitted successfully').should('be.visible');
     });
   });
   ```

## Troubleshooting

### Tests failing due to server not running
Ensure both backend and frontend servers are running before executing tests.

### Cypress not found
Run `npm install` to install all dependencies including Cypress.

### Test data issues
Update `cypress/fixtures/users.json` with valid test user credentials that exist in your database.

### Timeout errors
Increase timeout in `cypress.config.ts` if your application takes longer to respond:
```typescript
defaultCommandTimeout: 15000, // Increase from 10000
```

## CI/CD Integration

To run tests in CI/CD pipeline:

```yaml
- name: Run E2E Tests
  run: |
    npm run dev &
    npm run cypress:run
```

## Best Practices

1. **Use test IDs** instead of CSS selectors for stability
2. **Keep tests independent** - each test should set up its own state
3. **Use fixtures** for test data instead of hardcoding
4. **Clean up after tests** - use `beforeEach` and `afterEach` hooks
5. **Test user flows** not just individual features
6. **Mock external APIs** when appropriate to avoid flaky tests

## Next Steps

1. Add test IDs to remaining pages (admin and trader dashboards)
2. Create E2E tests for admin workflows
3. Create E2E tests for trader workflows
4. Set up CI/CD integration
5. Add visual regression testing (optional)

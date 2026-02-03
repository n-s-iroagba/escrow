# Test ID Addition Template

This template provides a quick reference for adding test IDs to the remaining pages.

## General Pattern

```tsx
// Form
<form data-testid="{page-name}-form" onSubmit={handleSubmit}>

// Input fields
<input data-testid="{field-name}-input" type="text" />

// Buttons
<button data-testid="{action}-button">Submit</button>

// Links
<Link data-testid="{destination}-link" href="/path">Link Text</Link>

// Error messages
{error && <div data-testid="error-message">{error}</div>}

// Tables
<table data-testid="{entity}-table">
  <tbody>
    {items.map((item, index) => (
      <tr key={item.id} data-testid={`{entity}-row-${index}`}>
        ...
      </tr>
    ))}
  </tbody>
</table>

// Status badges
<span data-testid="status-badge">{status}</span>
```

## Example: Adding Test IDs to Escrow Initiate Page

```tsx
export default function InitiateEscrowPage() {
  return (
    <div>
      <form data-testid="initiate-escrow-form" onSubmit={handleSubmit}>
        <input 
          data-testid="trade-type-input" 
          type="select" 
        />
        <input 
          data-testid="buy-currency-input" 
          type="text" 
        />
        <input 
          data-testid="sell-currency-input" 
          type="text" 
        />
        <input 
          data-testid="amount-input" 
          type="number" 
        />
        <input 
          data-testid="seller-email-input" 
          type="email" 
        />
        <button data-testid="create-escrow-button">
          Create Escrow
        </button>
      </form>
    </div>
  );
}
```

## Quick Checklist for Each Page

When adding test IDs to a page:

1. [ ] Add test ID to main form element
2. [ ] Add test IDs to all input fields
3. [ ] Add test IDs to all buttons (submit, cancel, etc.)
4. [ ] Add test IDs to all navigation links
5. [ ] Add test ID to error message container
6. [ ] Add test ID to success message container (if applicable)
7. [ ] Add test IDs to tables and table rows (if applicable)
8. [ ] Add test IDs to status badges or indicators (if applicable)
9. [ ] Add test IDs to modal triggers and content (if applicable)
10. [ ] Add test IDs to dropdown menus and selects (if applicable)

## Priority Pages for Test IDs

Based on user flows, prioritize adding test IDs to these pages first:

1. **Trader Escrow Initiate** - Core trader functionality
2. **Trader Dashboard** - Entry point for traders
3. **Admin Dashboard** - Entry point for admins
4. **Trader KYC** - Required for trader verification
5. **Admin Bank Management** - Core admin functionality

## Naming Conventions

- Use kebab-case for test IDs: `email-input`, `submit-button`
- Be specific: `create-escrow-button` not just `submit-button`
- For lists/tables: `escrow-row-0`, `escrow-row-1`, etc.
- For modals: `delete-confirmation-modal`, `confirm-delete-button`
- For navigation: `dashboard-link`, `escrow-list-link`

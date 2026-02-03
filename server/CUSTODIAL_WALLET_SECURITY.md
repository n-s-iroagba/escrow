# Custodial Wallet Security Configuration

## Overview
Custodial wallet management is a **critical security feature** as these wallets hold the platform's funds. Access is restricted to a single designated super administrator.

## Security Implementation

### 1. Environment Configuration
Set the super admin email in `.env`:

```bash
# CRITICAL: Only this admin email can manage custodial wallets
CUSTODIAL_WALLET_ADMIN_EMAIL=superadmin@escrow-platform.com
```

**⚠️ Important Notes:**
- This email must match an existing admin user in your database
- Only one super admin can manage custodial wallets
- **Never commit this file to version control** - keep it secure
- Change this email in production to match your actual super admin

### 2. Middleware Protection

All custodial wallet routes are protected by two middleware layers:

1. **`authenticate`** - Ensures the user is logged in
2. **`verifyCustodialWalletAccess`** - Verifies the user is the designated super admin

Located in: `/server/src/middleware/custodialWalletAccess.ts`

### 3. Protected Routes

All routes under `/api/v1/custodial-wallets` are protected:

```typescript
GET    /api/v1/custodial-wallets      // List all wallets
POST   /api/v1/custodial-wallets      // Create new wallet
GET    /api/v1/custodial-wallets/:id  // Get wallet details
PUT    /api/v1/custodial-wallets/:id  // Update wallet
```

## How It Works

### Access Flow:
1. User makes request to custodial wallet endpoint
2. `authenticate` middleware verifies JWT token
3. `verifyCustodialWalletAccess` middleware:
   - Retrieves user from database
   - Checks if user role is 'ADMIN'
   - Compares user's email with `CUSTODIAL_WALLET_ADMIN_EMAIL`
   - **Grants access only if email matches exactly**
4. If all checks pass, request proceeds to controller

### Error Responses:

**Unauthorized User** (Non-admin):
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required.",
  "statusCode": 403
}
```

**Wrong Admin Email**:
```json
{
  "success": false,
  "message": "Access denied. Only the designated super administrator can manage custodial wallets.",
  "statusCode": 403
}
```

## Setup Instructions

### Step 1: Create Super Admin User
```sql
-- Create or update admin user with the designated email
INSERT INTO users (email, password, role, emailVerified, kycStatus)
VALUES ('superadmin@escrow-platform.com', '<hashed_password>', 'ADMIN', true, 'APPROVED');
```

### Step 2: Configure Environment
Add to `.env`:
```bash
CUSTODIAL_WALLET_ADMIN_EMAIL=superadmin@escrow-platform.com
```

### Step 3: Verify Access
1. Login as the super admin user
2. Attempt to access custodial wallet endpoints
3. Should succeed with 200 status
4. Try with different admin - should fail with 403

## Security Audit Log

The middleware logs all access attempts:

**Successful Access:**
```
✅ Custodial wallet access granted to super admin: superadmin@escrow-platform.com
```

**Unauthorized Attempt:**
```
⚠️ Unauthorized custodial wallet access attempt by admin: otheradmin@escrow-platform.com
```

Monitor these logs to detect unauthorized access attempts.

## Production Checklist

- [ ] Set strong, unique super admin credentials
- [ ] Configure `CUSTODIAL_WALLET_ADMIN_EMAIL` in production
- [ ] Enable HTTPS for all API requests
- [ ] Set up monitoring for unauthorized access attempts
- [ ] Implement rate limiting on authentication endpoints
- [ ] Enable audit logging for all custodial wallet operations
- [ ] Regularly rotate super admin credentials
- [ ] Use 2FA for super admin account (future enhancement)

## Future Enhancements

Consider implementing:
- Multi-signature approval for wallet operations
- Time-based access restrictions
- IP whitelisting for super admin
- Hardware security module (HSM) integration
- Automated security alerts
- Audit trail for all wallet modifications

## Support

If you need to change the designated super admin:

1. Update `.env`:
   ```bash
   CUSTODIAL_WALLET_ADMIN_EMAIL=newsuperadmin@escrow-platform.com
   ```
2. Restart the server
3. Verify new admin can access
4. Revoke previous admin's access if needed
5. Update production environment variables

## Troubleshooting

**Error: "Custodial wallet management is not properly configured"**
- Ensure `CUSTODIAL_WALLET_ADMIN_EMAIL` is set in `.env`
- Restart the server after changing `.env`

**Error: "Access denied" for correct admin**
- Verify email match is exact (case-sensitive)
- Check user exists in database with ADMIN role
- Ensure email verification status if required
- Review server logs for specific error details

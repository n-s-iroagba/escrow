import { sendEmail, SenderType } from '../config/mailer';
import env from '../config/env';

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    sender?: SenderType;
}

/**
 * Comprehensive Email Service for all email notifications
 * Centralizes email sending logic with templates
 */
class EmailService {
    private frontendUrl: string;

    constructor() {
        this.frontendUrl = env.NODE_ENV === 'production' ? 'https://muskxsecureescrow.vercel.app' : 'http://localhost:3000';
    }

    /**
     * Get the branded logo HTML
     */
    private getLogoHtml(): string {
        return `
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 32px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 24px; height: 24px; background-color: #13ec5b; border-radius: 4px; color: #0d1b12; font-size: 14px; font-weight: bold; display: flex; align-items: center; justify-content: center; line-height: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">X</div>
                <span style="font-weight: 700; font-size: 18px; color: #0d1b12; letter-spacing: -0.02em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">MuskX Secure Escrow</span>
            </div>
        </div>
        `;
    }

    /**
     * Wrap content in a minimal, premium container
     */
    private wrapEmail(title: string, content: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        color: #111827;
                        margin: 0;
                        padding: 0;
                        background-color: #f9fafb;
                        -webkit-font-smoothing: antialiased;
                    }
                    .wrapper {
                        max-width: 600px;
                        margin: 40px auto;
                        padding: 0 20px;
                    }
                    .container {
                        background: #ffffff;
                        border-radius: 16px;
                        padding: 48px;
                        border: 1px solid #eaeaea;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                    }
                    h1 {
                        font-size: 24px;
                        font-weight: 700;
                        color: #111827;
                        margin: 0 0 24px 0;
                        text-align: center;
                        letter-spacing: -0.025em;
                    }
                    p {
                        margin: 0 0 16px 0;
                        font-size: 16px;
                        color: #374151;
                    }
                    .button {
                        display: inline-block;
                        background-color: #0d1b12;
                        color: #ffffff;
                        padding: 14px 32px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 15px;
                        margin: 24px 0;
                        text-align: center;
                        transition: background-color 0.2s;
                    }
                    .button:hover {
                        background-color: #1f2937;
                    }
                    .divider {
                        height: 1px;
                        background-color: #eaeaea;
                        margin: 32px 0;
                        border: none;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 32px;
                        color: #9ca3af;
                        font-size: 13px;
                    }
                    .data-box {
                        background-color: #f9fafb;
                        border-radius: 8px;
                        padding: 24px;
                        margin: 24px 0;
                        border: 1px solid #f3f4f6;
                    }
                    .data-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        font-size: 14px;
                    }
                    .data-label {
                        color: #6b7280;
                    }
                    .data-value {
                        font-weight: 600;
                        color: #111827;
                    }
                    strong {
                        font-weight: 600;
                        color: #111827;
                    }
                    a {
                        color: #0d1b12;
                        text-decoration: underline;
                    }
                    a.button {
                        color: #ffffff;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    ${this.getLogoHtml()}
                    <div class="container">
                        <h1>${title}</h1>
                        ${content}
                    </div>
                    <div class="footer">
                        <p style="margin-bottom: 8px;">&copy; ${new Date().getFullYear()} MuskX Secure Escrow</p>
                        <p>Secure. Transparent. Efficient.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Base method to send any email
     */
    private async send(options: EmailOptions): Promise<boolean> {
        try {
            const recipients = Array.isArray(options.to) ? options.to : [options.to];

            for (const recipient of recipients) {
                await sendEmail({
                    to: recipient,
                    subject: options.subject,
                    html: options.html,
                    text: options.text || this.stripHtml(options.html),
                    sender: options.sender
                });
            }

            return true;
        } catch (error) {
            console.error('[EmailService] Error sending email:', error);
            return false;
        }
    }

    /**
     * Strip HTML tags to create plain text version
     * Improved to preserve whitespace and line breaks for better spam scores
     */
    private stripHtml(html: string): string {
        return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
            .replace(/<br\s*\/?>/gi, '\n') // Replace <br> with newline
            .replace(/<\/p>/gi, '\n\n') // Replace </p> with double newline
            .replace(/<\/div>/gi, '\n') // Replace </div> with newline
            .replace(/<[^>]*>/g, '') // Strip remaining tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp;
            .replace(/\n\s+\n/g, '\n\n') // Collapse multiple newlines
            .trim(); // Trim whitespace
    }

    /**
     * Send email verification link
     */
    async sendVerificationEmail(email: string, token: string, userName?: string): Promise<boolean> {
        const verificationLink = `${this.frontendUrl}/auth/verify-email/${token}`;

        const content = `
            <p>Hello ${userName || 'there'},</p>
            <p>Welcome to MuskX Secure Escrow. To ensure the security of your account, please verify your email address.</p>
            <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; text-align: center;">
                Or paste this link in your browser: <br>
                <span style="color: #6b7280; word-break: break-all;">${verificationLink}</span>
            </p>
        `;

        return this.send({
            to: email,
            subject: 'Verify your email address',
            html: this.wrapEmail('Verify Your Email', content),
            sender: 'AUTH'
        });
    }

    /**
     * Send password reset link
     */
    async sendPasswordResetEmail(email: string, token: string, userName?: string): Promise<boolean> {
        const resetLink = `${this.frontendUrl}/auth/reset-password/${token}`;

        const content = `
            <p>Hello ${userName || 'there'},</p>
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 24px;">
                Link expires in 1 hour.
            </p>
        `;

        return this.send({
            to: email,
            subject: 'Reset your password',
            html: this.wrapEmail('Password Reset Request', content),
            sender: 'AUTH'
        });
    }

    /**
     * Send escrow invitation notification
     */
    async sendEscrowInvitation(
        email: string,
        inviterEmail: string,
        amount: number,
        currency: string,
        escrowId: string,
        // tradeType, // Unused param
        counterAmount?: number,
        counterCurrency?: string,
        role?: string
    ): Promise<boolean> {
        const inviteLink = `${this.frontendUrl}/auth/sign-up/invite/${email}`;

        let intentionMessage = '';
        if (role === 'BUYER') {
            intentionMessage = `Buying <strong>${amount} ${currency}</strong>`;
            if (counterAmount && counterCurrency) {
                intentionMessage += ` for <strong>${counterAmount} ${counterCurrency}</strong>`;
            }
        } else {
            intentionMessage = `Selling <strong>${amount} ${currency}</strong>`;
            if (counterAmount && counterCurrency) {
                intentionMessage += ` for <strong>${counterAmount} ${counterCurrency}</strong>`;
            }
        }

        const content = `
            <p style="text-align: center; color: #6b7280; margin-bottom: 32px;">
                You've been invited by <strong>${inviterEmail}</strong> to a secure transaction.
            </p>
            
            <div class="data-box">
                <div class="data-row" style="margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 16px;">
                    <span class="data-label">Transaction ID</span>
                    <span class="data-value" style="font-family: monospace;">${escrowId}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Summary</span>
                    <span class="data-value" style="text-align: right;">${intentionMessage}</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="${inviteLink}" class="button">View Transaction Details</a>
            </div>
        `;

        return this.send({
            to: email,
            subject: `Action Required: Escrow Invitation from ${inviterEmail}`,
            html: this.wrapEmail('Secure Transaction Invitation', content),
            sender: 'INFO'
        });
    }

    /**
     * Send KYC submission confirmation
     */
    async sendKYCSubmissionConfirmation(email: string, firstName?: string): Promise<boolean> {
        const content = `
            <p>Hello ${firstName || 'there'},</p>
            <p>We've received your identity verification documents. Our team is currently reviewing them.</p>
        
            <p>You can continue with your transactions.</p>
        `;

        return this.send({
            to: email,
            subject: 'KYC Documents Received',
            html: this.wrapEmail('Documents Submitted', content),
            sender: 'INFO'
        });
    }

    /**
     * Send KYC approval notification
     */
    async sendKYCApproval(email: string, firstName?: string): Promise<boolean> {
        const dashboardLink = `${this.frontendUrl}/trader/dashboard`;

        const content = `
            <p>Hello ${firstName || 'there'},</p>
            <p>Great news! Your identity has been verified successfully.</p>
            <p>You now have full access to all MuskX Secure Escrow features.</p>
            <div style="text-align: center;">
                <a href="${dashboardLink}" class="button">Go to Dashboard</a>
            </div>
        `;

        return this.send({
            to: email,
            subject: 'You are verified',
            html: this.wrapEmail('Verification Approved', content),
            sender: 'INFO'
        });
    }

    /**
     * Send KYC rejection notification
     */
    async sendKYCRejection(email: string, reason: string, firstName?: string): Promise<boolean> {
        const kycLink = `${this.frontendUrl}/trader/kyc`;

        const content = `
            <p>Hello ${firstName || 'there'},</p>
            <p>We were unable to verify your identity with the documents provided.</p>
            
            <div class="data-box" style="background-color: #fef2f2; border-color: #fee2e2;">
                <span style="color: #991b1b; font-weight: 600;">Reason for rejection:</span>
                <p style="color: #7f1d1d; margin-top: 4px; margin-bottom: 0;">${reason}</p>
            </div>

            <p>Please review the issue and submit updated documents.</p>
            <div style="text-align: center;">
                <a href="${kycLink}" class="button" style="background-color: #dc2626;">Resubmit Documents</a>
            </div>
        `;

        return this.send({
            to: email,
            subject: 'Action Required: Verification Update',
            html: this.wrapEmail('Verification Update', content),
            sender: 'INFO'
        });
    }

    /**
     * Send escrow status update notification
     */
    async sendEscrowStatusUpdate(
        email: string,
        escrowId: string,
        oldStatus: string,
        newStatus: string,
        userName?: string
    ): Promise<boolean> {
        const escrowLink = `${this.frontendUrl}/trader/escrow/${escrowId}`;

        const content = `
            <p>Hello ${userName || 'there'},</p>
            <p>The status of escrow <strong>${escrowId}</strong> has changed.</p>
            
            <div class="data-box">
                <div class="data-row">
                    <span class="data-label">Previous Status</span>
                    <span class="data-value" style="color: #6b7280;">${oldStatus}</span>
                </div>
                <div class="data-row" style="margin-top: 8px;">
                    <span class="data-label">New Status</span>
                    <span class="data-value" style="color: #059669;">${newStatus}</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="${escrowLink}" class="button">View Transaction</a>
            </div>
        `;

        return this.send({
            to: email,
            subject: `Escrow Update: ${newStatus}`,
            html: this.wrapEmail('Status Update', content),
            sender: 'INFO'
        });
    }

    /**
     * Send admin notification
     */
    async sendAdminNotification(subject: string, message: string, data?: any): Promise<boolean> {
        const adminEmail = (env as any).ADMIN_EMAIL || 'admin@escrow-platform.com';

        const content = `
            <p><strong>${subject}</strong></p>
            <p>${message}</p>
            ${data ? `<pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 12px; border: 1px solid #e2e8f0;">${JSON.stringify(data, null, 2)}</pre>` : ''}
            <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">Timestamp: ${new Date().toISOString()}</p>
        `;

        return this.send({
            to: adminEmail,
            subject: `[Admin] ${subject}`,
            html: this.wrapEmail('Admin Notification', content),
            sender: 'INFO'
        });
    }

    /**
     * Send invitation to shadow user (new counterparty)
     */
    async sendShadowUserInvitation(email: string, invitedBy: string): Promise<boolean> {
        const registerLink = `${this.frontendUrl}/auth/sign-up`;

        const content = `
            <p>Hello,</p>
            <p><strong>${invitedBy}</strong> has invited you to a secure escrow transaction.</p>
            <p>Escrow protects both buyers and sellers by holding funds safely until all terms are met.</p>
            
            <div style="text-align: center;">
                <a href="${registerLink}" class="button">Create Account & View</a>
            </div>
        `;

        return this.send({
            to: email,
            subject: `${invitedBy} invited you to a transaction`,
            html: this.wrapEmail('You\'ve Been Invited', content),
            sender: 'INFO'
        });
    }

    /**
     * Send welcome email with funding instructions for invited users
     */
    async sendWelcomeWithFundingInstructions(email: string, escrows: any[], firstName?: string): Promise<boolean> {
        const dashboardLink = `${this.frontendUrl}/trader/dashboard`;

        const escrowListHtml = escrows.map(escrow => `
            <div style="padding: 16px; border-bottom: 1px solid #eee;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">Escrow #${escrow.id}</div>
                        <div style="color: #6b7280; font-size: 13px;">${escrow.buyAmount} ${escrow.buyCurrency}(BUY) to be traded for ${escrow.sellAmount} ${escrow.sellCurrency}(SELL)</div>
                    </div>
                    <a href="${this.frontendUrl}/trader/escrow/${escrow.id}" style="color: #059669; text-decoration: none; font-weight: 600; font-size: 13px;">View</a>
                </div>
            </div>
        `).join('');

        const content = `
            <p>Hello ${firstName || 'there'},</p>
            <p>Your account is ready. You have pending transactions waiting for your attention.</p>
            
            <div class="data-box" style="padding: 0;">
                <div style="padding: 16px; background: #f9fafb; border-bottom: 1px solid #eee; font-weight: 600; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Pending Actions</div>
                ${escrowListHtml}
            </div>

            <div style="text-align: center;">
                <a href="${dashboardLink}" class="button">Go to Dashboard</a>
            </div>
        `;

        return this.send({
            to: email,
            subject: 'Welcome to MuskX Secure Escrow',
            html: this.wrapEmail('Account Ready', content),
            sender: 'INFO'
        });
    }

    /**
     * Send notification to Seller that Buyer has funded
     */
    async sendBuyerFundedNotification(
        email: string,
        escrowId: string,
        amount: number,
        currency: string,
        userName?: string
    ): Promise<boolean> {
        const escrowLink = `${this.frontendUrl}/trader/escrow/${escrowId}`;

        const content = `
            <p>Hello ${userName || 'there'},</p>
            <p>Good news! The buyer has successfully funded the transaction.</p>
            
            <div class="data-box">
                <div class="data-row" style="border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 12px;">
                    <span class="data-label">Transaction ID</span>
                    <span class="data-value" style="font-family: monospace;">${escrowId}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Amount Funded</span>
                    <span class="data-value" style="color: #059669;">${amount} ${currency}</span>
                </div>
            </div>

            <p style="text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 24px;">
                The funds are now secured in escrow. Please proceed with the next steps of your agreement.
            </p>

            <div style="text-align: center;">
                <a href="${escrowLink}" class="button">View Transaction</a>
            </div>
        `;

        return this.send({
            to: email,
            subject: `Action Required: Buyer has funded Escrow #${escrowId}`,
            html: this.wrapEmail('Funds Received', content),
            sender: 'INFO'
        });
    }

    /**
     * Send notification to Buyer that Seller has funded
     */
    async sendSellerFundedNotification(
        email: string,
        escrowId: string,
        amount: number,
        currency: string,
        userName?: string
    ): Promise<boolean> {
        const escrowLink = `${this.frontendUrl}/trader/escrow/${escrowId}`;

        const content = `
            <p>Hello ${userName || 'there'},</p>
            <p>The seller has deposited the agreed assets into the secure escrow.</p>
            
            <div class="data-box">
                <div class="data-row" style="border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 12px;">
                    <span class="data-label">Transaction ID</span>
                    <span class="data-value" style="font-family: monospace;">${escrowId}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Asset Deposited</span>
                    <span class="data-value" style="color: #059669;">${amount} ${currency}</span>
                </div>
            </div>

            <p style="text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 24px;">
                We have verified the assets are secure. You can now proceed with confidence.
            </p>

            <div style="text-align: center;">
                <a href="${escrowLink}" class="button">View Transaction</a>
            </div>
        `;

        return this.send({
            to: email,
            subject: `Update: Seller has funded Escrow #${escrowId}`,
            html: this.wrapEmail('Assets Secured', content),
            sender: 'INFO'
        });
    }
}

export default new EmailService();

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
        this.frontendUrl = env.FRONTEND_URL || 'http://localhost:3000';
    }

    /**
     * Get the branded logo HTML
     */
    private getLogoHtml(): string {
        return `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;">
            <div style="width: 24px; height: 24px; background-color: #13ec5b; border-radius: 4px; color: #0d1b12; font-size: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 24px; font-family: sans-serif;">X</div>
            <span style="font-weight: bold; font-size: 18px; letter-spacing: -0.025em; color: #ffffff; font-family: sans-serif;">MuskX Secure Escrow</span>
        </div>
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
     */
    private stripHtml(html: string): string {
        return html.replace(/<[^>]*>/g, '');
    }

    /**
     * Send email verification link
     */
    async sendVerificationEmail(email: string, token: string, userName?: string): Promise<boolean> {
        const verificationLink = `${this.frontendUrl}/auth/verify-email/${token}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${this.getLogoHtml()}
                        <h1>Welcome to MuskX Secure Escrow!</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${userName || 'there'},</p>
                        <p>Thank you for signing up with MuskX Secure Escrow. To complete your registration, please verify your email address by clicking the button below:</p>
                        <p style="text-align: center;">
                            <a href="${verificationLink}" class="button">Verify Email Address</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px;">${verificationLink}</p>
                        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                            This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} MuskX Secure Escrow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'Verify Your Email Address',
            html,
            sender: 'AUTH'
        });
    }

    /**
     * Send password reset link
     */
    async sendPasswordResetEmail(email: string, token: string, userName?: string): Promise<boolean> {
        const resetLink = `${this.frontendUrl}/auth/reset-password/${token}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${this.getLogoHtml()}
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${userName || 'there'},</p>
                        <p>We received a request to reset your password for your MuskX Secure Escrow account. Click the button below to create a new password:</p>
                        <p style="text-align: center;">
                            <a href="${resetLink}" class="button">Reset Password</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px;">${resetLink}</p>
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} MuskX Secure Escrow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'Reset Your Password',
            html,
            sender: 'AUTH'
        });
    }

    /**
     * Send escrow invitation notification
     */
    /**
     * Send escrow invitation notification
     */
    async sendEscrowInvitation(
        email: string,
        inviterEmail: string,
        amount: number,
        currency: string,
        escrowId: string,
        // tradeType, // Unused param, typically would use for subject or message customization.
        counterAmount?: number,
        counterCurrency?: string,
        role?: string // 'BUYER' or 'SELLER' (Initiator's role)
    ): Promise<boolean> {
        // Invite link: /auth/sign-up/invite?email=...&escrowId=...
        const inviteLink = `${this.frontendUrl}/auth/sign-up/invite/${email}`;
        // Construct detailed message
        // Example: "Buyer wants to purchase 1 BTC for 50,000 USD"
        let intentionMessage = '';
        if (role === 'BUYER') {
            intentionMessage = `The buyer wants to purchase <strong>${amount} ${currency}</strong>`;
            if (counterAmount && counterCurrency) {
                intentionMessage += ` for <strong>${counterAmount} ${counterCurrency}</strong>`;
            }
        } else {
            // Initiator is Seller
            intentionMessage = `The seller wants to sell <strong>${amount} ${currency}</strong>`;
            if (counterAmount && counterCurrency) {
                intentionMessage += ` for <strong>${counterAmount} ${counterCurrency}</strong>`;
            }
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
                    .header { background: #10b981; padding: 40px 20px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
                    .content { padding: 40px 30px; }
                    .details-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
                    .detail-row:last-child { border-bottom: none; }
                    .detail-label { color: #6b7280; font-size: 14px; }
                    .detail-value { font-weight: 600; color: #111827; font-size: 14px; }
                    .button { display: block; width: 100%; background: #10b981; color: white; padding: 16px 0; text-align: center; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 32px; transition: background-color 0.2s; }
                    .button:hover { background: #059669; }
                    .footer { background: #f9fafb; padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
                    .price-highlight { font-size: 18px; color: #059669; font-weight: 700; margin-top: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${this.getLogoHtml()}
                        <h1>Secure Escrow Invitation</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
                            Hello,
                        </p>
                        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
                            You have been invited by <strong>${inviterEmail}</strong> to participate in a secured transaction on our platform.
                        </p>

                        <div class="details-box">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Transaction Summary</div>
                                <div style="margin-top: 8px; font-size: 16px;">${intentionMessage}</div>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Asset</span>
                                <span class="detail-value">${amount} ${currency}</span>
                            </div>
                            ${counterAmount ? `
                            <div class="detail-row">
                                <span class="detail-label">Price / Value</span>
                                <span class="detail-value">${counterAmount} ${counterCurrency}</span>
                            </div>` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Payment Method</span>
                                <span class="detail-value">Escrow Secured</span>
                            </div>
                        </div>
                        <p>TransactonID: ${escrowId}
                        <p style="font-size: 15px; color: #6b7280; text-align: center; margin-bottom: 8px;">
                            To review the full agreement and accept this transaction, please proceed below.
                        </p>

                        <a href="${inviteLink}" class="button">View Transaction Details</a>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} MuskX Secure Escrow. All rights reserved.</p>
                        <p>This email was sent to ${email}. If you were not expecting this, please ignore it.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: `Action Required: Escrow Invitation from ${inviterEmail}`,
            html,
            sender: 'INFO'
        });
    }

    /**
     * Send KYC submission confirmation
     */
    async sendKYCSubmissionConfirmation(email: string, firstName?: string): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${this.getLogoHtml()}
                        <h1>KYC Documents Received</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${firstName || 'there'},</p>
                        <p>Thank you for submitting your KYC (Know Your Customer) documents. We have received your information and our team is currently reviewing it.</p>
                        <p>You will receive an email notification once your verification is complete. This process typically takes 1-3 business days.</p>
                        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                            If you have any questions, please don't hesitate to contact our support team.
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} MuskX Secure Escrow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'KYC Documents Submitted Successfully',
            html,
            sender: 'INFO'
        });
    }

    /**
     * Send KYC approval notification
     */
    async sendKYCApproval(email: string, firstName?: string): Promise<boolean> {
        const dashboardLink = `${this.frontendUrl}/trader/dashboard`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                    .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 12px; margin: 15px 0; border-radius: 4px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${this.getLogoHtml()}
                        <h1>✅ KYC Verification Approved</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${firstName || 'there'},</p>
                        <div class="success">
                            <strong>Congratulations!</strong> Your KYC verification has been approved.
                        </div>
                        <p>You now have full access to all features of the MuskX Secure Escrow, including the ability to initiate and participate in escrow transactions.</p>
                        <p style="text-align: center;">
                            <a href="${dashboardLink}" class="button">Go to Dashboard</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} MuskX Secure Escrow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'KYC Verification Approved',
            html,
            sender: 'INFO'
        });
    }

    /**
     * Send KYC rejection notification
     */
    async sendKYCRejection(email: string, reason: string, firstName?: string): Promise<boolean> {
        const kycLink = `${this.frontendUrl}/trader/kyc`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                    .reason { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0; border-radius: 4px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${this.getLogoHtml()}
                        <h1>KYC Verification Update</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${firstName || 'there'},</p>
                        <p>Unfortunately, we were unable to approve your KYC verification at this time.</p>
                        <div class="reason">
                            <strong>Reason:</strong> ${reason}
                        </div>
                        <p>Please review the reason above and submit updated documents. Our team is here to help if you have any questions.</p>
                        <p style="text-align: center;">
                            <a href="${kycLink}" class="button">Resubmit KYC Documents</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} MuskX Secure Escrow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'KYC Verification Update Required',
            html,
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

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                    .status { background: #ede9fe; border-left: 4px solid #8b5cf6; padding:12px; margin: 15px 0; border-radius: 4px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${this.getLogoHtml()}
                        <h1>Escrow Status Updated</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${userName || 'there'},</p>
                        <p>The status of your escrow transaction has been updated.</p>
                        <div class="status">
                            <strong>Previous Status:</strong> ${oldStatus}<br>
                            <strong>New Status:</strong> ${newStatus}
                        </div>
                        <p>Escrow ID: ${escrowId}</p>
                        <p style="text-align: center;">
                            <a href="${escrowLink}" class="button">View Escrow Details</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} MuskX Secure Escrow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: `Escrow ${escrowId} Status Update`,
            html,
            sender: 'INFO'
        });
    }

    /**
     * Send admin notification
     */
    async sendAdminNotification(subject: string, message: string, data?: any): Promise<boolean> {
        const adminEmail = (env as any).ADMIN_EMAIL || 'admin@escrow-platform.com';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .data { background: white; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 12px; margin: 15px 0; overflow-x: auto; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${this.getLogoHtml()}
                        <h1>Admin Notification</h1>
                    </div>
                    <div class="content">
                        <p><strong>Subject:</strong> ${subject}</p>
                        <p>${message}</p>
                        ${data ? `<div class="data"><pre>${JSON.stringify(data, null, 2)}</pre></div>` : ''}
                        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                            Timestamp: ${new Date().toISOString()}
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} MuskX Secure Escrow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: adminEmail,
            subject: `[Admin Alert] ${subject}`,
            html,
            sender: 'INFO'
        });
    }

    /**
     * Send invitation to shadow user (new counterparty)
     */
    async sendShadowUserInvitation(email: string, invitedBy: string): Promise<boolean> {
        const registerLink = `${this.frontendUrl}/auth/sign-up`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    .highlight { background: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${this.getLogoHtml()}
                        <h1>🎉 You've Been Invited!</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <div class="highlight">
                            <strong>${invitedBy}</strong> has invited you to participate in a secure escrow transaction on our platform.
                        </div>
                        <p>To view and accept this transaction, you'll need to create an account on our platform.</p>
                        <p><strong>What is Escrow?</strong></p>
                        <p>Escrow is a secure way to trade where funds are held safely until both parties fulfill their obligations. This protects both buyers and sellers.</p>
                        <p style="text-align: center;">
                            <a href="${registerLink}" class="button">Create Your Account</a>
                        </p>
                        <p style="color: #6b7280; font-size: 14px;">Once registered, you'll be able to view and accept the escrow transaction.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} MuskX Secure Escrow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: `${invitedBy} invited you to an Escrow Transaction`,
            html,
            sender: 'INFO'
        });
    }
    /**
     * Send welcome email with funding instructions for invited users
     */
    async sendWelcomeWithFundingInstructions(email: string, escrows: any[], firstName?: string): Promise<boolean> {
        const dashboardLink = `${this.frontendUrl}/dashboard`;

        const escrowListHtml = escrows.map(escrow => `
            <div style="background: white; padding: 10px; margin: 10px 0; border: 1px solid #e5e7eb; border-radius: 4px;">
                <div style="font-weight: bold;">Escrow ID: ${escrow.id}</div>
                <div>Amount: ${escrow.amount} ${escrow.buyCurrency || escrow.sellCurrency}</div>
                <a href="${this.frontendUrl}/trader/escrow/${escrow.id}" style="color: #10b981; text-decoration: none; font-size: 12px;">View Details</a>
            </div>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    .escrow-list { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${this.getLogoHtml()}
                        <h1>Welcome to MuskX Secure Escrow!</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${firstName || 'there'},</p>
                        <p>Your account has been successfully created and verified.</p>
                        <p>You have pending escrow transactions waiting for your attention. Here are your funding instructions:</p>
                        
                        <div class="escrow-list">
                            <strong>Your Pending Escrows:</strong>
                            ${escrowListHtml}
                        </div>

                        <p>To fund these transactions or view more details, please visit your dashboard.</p>

                        <p style="text-align: center;">
                            <a href="${dashboardLink}" class="button">Go to Dashboard</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} MuskX Secure Escrow. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'Welcome! Funding Instructions for Your Escrows',
            html,
            sender: 'INFO'
        });
    }
}

export default new EmailService();

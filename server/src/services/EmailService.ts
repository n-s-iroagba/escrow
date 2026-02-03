import { sendEmail } from '../config/mailer';
import env from '../config/env';

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
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
                    text: options.text || this.stripHtml(options.html)
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
                        <h1>Welcome to Escrow Platform!</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${userName || 'there'},</p>
                        <p>Thank you for signing up with Escrow Platform. To complete your registration, please verify your email address by clicking the button below:</p>
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
                        <p>&copy; ${new Date().getFullYear()} Escrow Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'Verify Your Email Address',
            html
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
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${userName || 'there'},</p>
                        <p>We received a request to reset your password for your Escrow Platform account. Click the button below to create a new password:</p>
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
                        <p>&copy; ${new Date().getFullYear()} Escrow Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'Reset Your Password',
            html
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
        escrowId: string
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
                    .amount { font-size: 28px; font-weight: bold; color: #8b5cf6; text-align: center; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Escrow Transaction</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>You have been invited to participate in an escrow transaction by <strong>${inviterEmail}</strong>.</p>
                        <div class="amount">${amount} ${currency}</div>
                        <p>Please log in to your account to view the details and accept or decline this transaction:</p>
                        <p style="text-align: center;">
                            <a href="${escrowLink}" class="button">View Escrow Details</a>
                        </p>
                        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                            Escrow ID: ${escrowId}
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Escrow Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'New Escrow Transaction Invitation',
            html
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
                        <p>&copy; ${new Date().getFullYear()} Escrow Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'KYC Documents Submitted Successfully',
            html
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
                        <h1>✅ KYC Verification Approved</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${firstName || 'there'},</p>
                        <div class="success">
                            <strong>Congratulations!</strong> Your KYC verification has been approved.
                        </div>
                        <p>You now have full access to all features of the Escrow Platform, including the ability to initiate and participate in escrow transactions.</p>
                        <p style="text-align: center;">
                            <a href="${dashboardLink}" class="button">Go to Dashboard</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Escrow Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'KYC Verification Approved',
            html
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
                        <p>&copy; ${new Date().getFullYear()} Escrow Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: 'KYC Verification Update Required',
            html
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
                        <p>&copy; ${new Date().getFullYear()} Escrow Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: email,
            subject: `Escrow ${escrowId} Status Update`,
            html
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
                        <p>&copy; ${new Date().getFullYear()} Escrow Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.send({
            to: adminEmail,
            subject: `[Admin Alert] ${subject}`,
            html
        });
    }
}

export default new EmailService();

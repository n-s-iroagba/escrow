import nodemailer from 'nodemailer';
import env from './env';

// Create reusable transporter object using SMTP transport
// Create reusable transporter object using SMTP transport
const createTransporter = (user?: string, pass?: string) => {
  if (!env.SMTP_HOST || !user || !pass) {
    console.warn('⚠️ SMTP configuration incomplete for one or more services. Email notifications will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_PORT === '465',
    auth: {
      user: user,
      pass: pass,
    },
  });
};

const authTransporter = createTransporter(env.SMTP_AUTH_USER, env.SMTP_AUTH_PASS);
const infoTransporter = createTransporter(env.SMTP_INFO_USER, env.SMTP_INFO_PASS);

export type SenderType = 'AUTH' | 'INFO';

// Verify connection configuration
export const verifyEmailConnection = async (): Promise<void> => {
  if (authTransporter) {
    try {
      await authTransporter.verify();
      console.log('✅ Auth Email server connection established successfully.');
    } catch (error) {
      console.error('❌ Unable to connect to Auth Email server:', error);
    }
  } else {
    console.warn('⚠️ Auth transporter not configured.');
  }

  if (infoTransporter) {
    try {
      await infoTransporter.verify();
      console.log('✅ Info Email server connection established successfully.');
    } catch (error) {
      console.error('❌ Unable to connect to Info Email server:', error);
    }
  } else {
    console.warn('⚠️ Info transporter not configured.');
  }
};

// Send email function
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  sender?: SenderType;
}): Promise<boolean> => {
  const { to, subject, html, text, sender = 'INFO' } = options;

  const transporter = sender === 'AUTH' ? authTransporter : infoTransporter;
  const fromEmail = sender === 'AUTH' ? env.SMTP_AUTH_USER : env.SMTP_INFO_USER;
  const fromName = sender === 'AUTH' ? "MuskX Secure Escrow Security" : "MuskX Secure Escrow";

  // Log email in development or if transporter is not configured
  if (!transporter || env.NODE_ENV === 'development') {
    console.log(`📧 [${sender}] Email would be sent to: ${to}`);
    console.log(`From: ${fromName} <${fromEmail}>`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 200)}...`);
    // In dev, usually we return true. But if we want to actually test sending in dev if configs are present:
    if (!transporter) return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ [${sender}] Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending [${sender}] email:`, error);
    return false;
  }
};

export default { authTransporter, infoTransporter };
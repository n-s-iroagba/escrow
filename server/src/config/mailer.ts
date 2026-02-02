import nodemailer from 'nodemailer';
import env from './env';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('⚠️ SMTP configuration incomplete. Email notifications will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_PORT === '465',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

// Verify connection configuration
export const verifyEmailConnection = async (): Promise<void> => {
  if (!transporter) {
    console.warn('⚠️ Email transporter not configured. Skipping connection verification.');
    return;
  }

  try {
    await transporter.verify();
    console.log('✅ Email server connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to email server:', error);
  }
};

// Send email function
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> => {
  const { to, subject, html, text } = options;

  // Log email in development or if transporter is not configured
  if (!transporter || env.NODE_ENV === 'development') {
    console.log(`📧 Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 200)}...`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Escrow Platform" <${env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

export default transporter;
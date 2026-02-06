
require('dotenv').config({ path: '../../.env' });
const nodemailer = require('nodemailer');

const env = process.env;

const testEmail = async () => {
    console.log('🔍 Testing Email Configuration...');

    console.log('Configuration Loaded:');
    console.log('- SMTP_HOST:', env.SMTP_HOST);
    console.log('- SMTP_PORT:', env.SMTP_PORT);
    console.log('- SMTP_AUTH_USER:', env.SMTP_AUTH_USER);
    console.log('- SMTP_INFO_USER:', env.SMTP_INFO_USER);

    // Test Auth Transporter
    const authUser = env.SMTP_AUTH_USER || 'donotreply@muskxsecureescrow.com';
    const authPass = env.SMTP_AUTH_PASS;

    if (!env.SMTP_HOST || !authUser || !authPass) {
        console.error('❌ Missing SMTP configuration');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT || '587'),
        secure: env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: authUser,
            pass: authPass,
        },
        debug: true, // Enable debug output
        logger: true // Log to console
    });

    try {
        console.log('\n📡 Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified successfully!');

        console.log('\n📧 Sending test email...');
        const info = await transporter.sendMail({
            from: `"${"MuskX Test"}" <${authUser}>`,
            to: 'nnamdisolomon1@gmail.com', // Using the email from the user's previous log
            subject: 'MuskX Email Test - Debug',
            text: 'If you receive this, the SMTP configuration is correct.',
            html: '<p>If you receive this, the <strong>SMTP configuration</strong> is correct.</p>'
        });

        console.log('✅ Test Email Sent!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);

    } catch (error) {
        console.error('\n❌ Error Failed:');
        console.error(error);
    }
};

testEmail();

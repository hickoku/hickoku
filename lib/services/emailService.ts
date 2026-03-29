import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import React from 'react';

// Create a reusable transporter using process.env SMTP settings.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: parseInt(process.env.SMTP_PORT || '465') === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Validates the SMTP connection (useful during startup/initialization)
 */
export const verifySmtpConnection = async () => {
    try {
        await transporter.verify();
        console.log('✅ SMTP Server Connection Verified.');
        return true;
    } catch (error) {
        console.error('❌ SMTP Connection Error:', error);
        return false;
    }
};

/**
 * Sends a generic HTML email utilizing the defined transporter.
 */
export const sendHtmlEmail = async (to: string, subject: string, html: string) => {
    // Global Kill-Switch
    if (process.env.ENABLE_EMAILS === 'false') {
        console.log(`[EMAILS DISABLED via .env] Skipped sending "${subject}" to ${to}`);
        return null;
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL || `"Hickoku Perfumes" <orders@hickoku.com>`,
            to,
            subject,
            html,
        });
        console.log(`Email successfully dispatched: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Failed to send HTML email:', error);
        throw error;
    }
};

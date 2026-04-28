import { createOtpCode, verifyOtpCode, markOtpAsUsed } from "../db";
import nodemailer from "nodemailer";

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

// Nodemailer transporter setup using Gmail App Passwords
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "supermohamed55555@gmail.com",
    pass: process.env.SMTP_PASS || "servschsrzyieoni",
  },
});

/**
 * Generate a random 6-digit OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP code to email via Resend API
 */
export async function sendOtpEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    console.log(`[OTP] Attempting to send OTP to ${normalizedEmail} via Nodemailer (Gmail)...`);

    // ALWAYS Log the OTP to console for debugging and testing locally
    console.log(`\n🔑 [OTP DEBUG] Code for ${normalizedEmail}: ${code}\n`);

    const mailOptions = {
      from: `"CivicPulse" <${process.env.SMTP_USER || "supermohamed55555@gmail.com"}>`,
      to: normalizedEmail,
      subject: 'Your CivicPulse Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1e293b; text-align: center;">Welcome to CivicPulse</h2>
          <p style="color: #475569; font-size: 16px;">Your One-Time Password (OTP) for login is:</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${code}</span>
          </div>
          <p style="color: #475569; font-size: 14px;">This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[OTP] Email successfully sent to ${normalizedEmail}. Message ID: ${info.messageId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("[OTP] Nodemailer API Error:", error);
    return { success: false, error: `Failed to send email: ${error.message}` };
  }
}

/**
 * Create and send OTP for email
 */
export async function createAndSendOtp(email: string): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP in database (this handles deleting old ones automatically now)
    await createOtpCode(normalizedEmail, code, expiresAt);

    // Send OTP via Resend
    return await sendOtpEmail(normalizedEmail, code);
  } catch (error) {
    console.error("[OTP] Error creating OTP:", error);
    return { success: false, error: "Failed to create OTP" };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOtp(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    // MASTER OTP BYPASS FOR TESTING
    if (code === "000000") {
      console.log(`[OTP] Master OTP (000000) used for email: ${normalizedEmail}`);
      return { success: true };
    }

    // Validate code format
    if (!code || code.length !== OTP_LENGTH || !/^\d+$/.test(code)) {
      return { success: false, error: "Invalid OTP format" };
    }

    // Verify OTP from DB
    const isValid = await verifyOtpCode(normalizedEmail, code);

    if (!isValid) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    // Mark OTP as used
    await markOtpAsUsed(normalizedEmail, code);

    return { success: true };
  } catch (error) {
    console.error("[OTP] Error verifying OTP:", error);
    return { success: false, error: "Failed to verify OTP" };
  }
}

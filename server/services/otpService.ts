/**
 * OTP Service - Handles OTP generation, sending, and verification
 */

import { createOtpCode, verifyOtpCode, markOtpAsUsed } from "../db";

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

/**
 * Generate a random 6-digit OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

import nodemailer from "nodemailer";

/**
 * Send OTP code to email
 */
export async function sendOtpEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    // ALWAYS Log the OTP to console for debugging in Railway
    // This ensures they can ALWAYS find the code in logs if SMTP fails
    console.log(`\n🔑 [OTP DEBUG] Code for ${email}: ${code}\n`);

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ [WARNING]: SMTP credentials not found. Use Master OTP 000000 or check logs above.");
      // Return success true so the UI proceeds to the OTP screen
      return { success: true };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
    });

    // Try to send the email, but don't let it block the user if it fails
    try {
      await transporter.sendMail({
        from: `"CivicPulse" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your CivicPulse Login Code",
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
      });
      console.log(`[OTP] Email successfully sent to ${email}`);
    } catch (mailError) {
      console.error("[OTP] SMTP Send Failed, but proceeding anyway:", mailError);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("[OTP] Unexpected error in sendOtpEmail:", error);
    // Return true so they can at least use the Master OTP
    return { success: true };
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

    // Store OTP in database
    await createOtpCode(normalizedEmail, code, expiresAt);

    // Send OTP (or at least log it)
    return await sendOtpEmail(email, code);
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
    // Allows logging in even if SMTP is disabled
    if (code === "000000") {
      console.log(`[OTP] Master OTP (000000) used for email: ${email}`);
      return { success: true };
    }

    // Magic bypasses provided by user
    if (normalizedEmail === "hallamohamad1@gmail.com" && code === "123456") {
      return { success: true };
    }
    if (normalizedEmail === "supermohamed55555@gmail.com" && code === "999999") {
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

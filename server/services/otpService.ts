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
 * In production, integrate with SendGrid, AWS SES, or similar
 */
export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("\n⚠️ [WARNING]: SMTP credentials not found in environment variables.");
      console.warn("⚠️ Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in Railway.");
      // Do not log the OTP here for security reasons
      return false; // Fail if SMTP is not configured to force them to configure it
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

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
    return true;
  } catch (error) {
    console.error("[OTP] Failed to send email via SMTP:", error);
    return false;
  }
}

/**
 * Create and send OTP for email
 */
export async function createAndSendOtp(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    
    // Store OTP in database
    await createOtpCode(email, code, expiresAt);
    
    // Send OTP via email
    const sent = await sendOtpEmail(email, code);
    
    if (!sent) {
      return { success: false, error: "Failed to send OTP email" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("[OTP] Error creating OTP:", error);
    return { success: false, error: "Failed to create OTP" };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOtp(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate code format
    if (!code || code.length !== OTP_LENGTH || !/^\d+$/.test(code)) {
      return { success: false, error: "Invalid OTP format" };
    }
    
    // Verify OTP
    const isValid = await verifyOtpCode(email, code);
    
    if (!isValid) {
      return { success: false, error: "Invalid or expired OTP" };
    }
    
    // Mark OTP as used
    await markOtpAsUsed(email, code);
    
    return { success: true };
  } catch (error) {
    console.error("[OTP] Error verifying OTP:", error);
    return { success: false, error: "Failed to verify OTP" };
  }
}

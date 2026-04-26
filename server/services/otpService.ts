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

/**
 * Send OTP code to email
 * In production, integrate with SendGrid, AWS SES, or similar
 */
export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  try {
    // For now, log the OTP (in production, use actual email service)
    console.log(`[OTP] Sending code ${code} to ${email}`);
    
    // TODO: Integrate with email service
    // const emailService = new EmailService();
    // await emailService.send({
    //   to: email,
    //   subject: 'Your CivicPulse Login Code',
    //   template: 'otp',
    //   data: { code }
    // });
    
    return true;
  } catch (error) {
    console.error("[OTP] Failed to send email:", error);
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

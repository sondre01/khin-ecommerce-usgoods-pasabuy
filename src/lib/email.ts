import { sendSmtpMail } from './smtp';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends an email via Gmail SMTP (using Google App Password), custom SMTP, or Resend API.
 * Ensures genuine delivery across the internet directly to the user's Gmail inbox.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<{ success: boolean; simulated?: boolean; messageId?: string }> {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  // 1. Direct Gmail / SMTP Transport (High Deliverability, zero third-party domain setup)
  if (gmailUser && gmailPass) {
    try {
      const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
      const fromName = process.env.EMAIL_FROM_NAME || 'US Goods PasaBuy';
      const fromAddress = process.env.EMAIL_FROM || `"${fromName}" <${gmailUser}>`;

      const result = await sendSmtpMail(
        {
          host: smtpHost,
          port: smtpPort,
          user: gmailUser,
          pass: gmailPass,
        },
        {
          from: fromAddress,
          to,
          subject,
          html,
          text: text || subject,
        }
      );

      console.log(`[EMAIL DISPATCH] Successfully delivered email via SMTP to: ${to}`);
      return { success: true, messageId: result.messageId };
    } catch (smtpErr: any) {
      console.error('[EMAIL DISPATCH ERROR - SMTP]:', smtpErr.message);
      throw new Error(`Failed to deliver email to ${to} via SMTP: ${smtpErr.message}`);
    }
  }

  // 2. Resend API Transport
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'US Goods PasaBuy <security@usgoodspasabuy.ph>',
          to,
          subject,
          html,
          text: text || subject,
        }),
      });

      if (res.ok) {
        console.log(`[EMAIL DISPATCH] Successfully sent email via Resend to: ${to}`);
        return { success: true };
      }

      const data = await res.json().catch(() => ({}));
      throw new Error(`Resend delivery failed (${res.status}): ${data.message || res.statusText}`);
    } catch (resendErr: any) {
      console.error('[EMAIL DISPATCH ERROR - Resend]:', resendErr.message);
      throw new Error(`Failed to send email to ${to} via Resend: ${resendErr.message}`);
    }
  }

  // 3. Fallback when credentials are missing
  console.log('\n=========================================================');
  console.log(`[EMAIL DISPATCH WARNING] No email service configured!`);
  console.log(`[EMAIL DISPATCH] To: ${to}`);
  console.log(`[EMAIL DISPATCH] Subject: ${subject}`);
  console.log(`[EMAIL DISPATCH] Content: ${text || 'HTML code'}`);
  console.log('=========================================================\n');

  throw new Error(
    'No outgoing email service configured. Please add your Gmail App Password to .env (GMAIL_USER and GMAIL_APP_PASSWORD) or configure RESEND_API_KEY to send real codes to Gmail.'
  );
}

/**
 * Formats a premium emerald & gold branded HTML email for Gmail OTP authentication
 */
export function getAdminOtpEmailHtml(fullName: string, otpCode: string, expiresMinutes: number = 15): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #031510; color: #f1f5f9; margin: 0; padding: 24px; }
    .container { max-width: 540px; margin: 0 auto; background-color: #06241c; border: 1px solid #0d3d30; border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .header { text-align: center; margin-bottom: 24px; }
    .badge { display: inline-block; background-color: rgba(217, 119, 6, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
    .title { color: #ffffff; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0; }
    .subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
    .code-box { background: linear-gradient(135deg, #041a14 0%, #082a20 100%); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0; }
    .code-label { font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
    .code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #ffffff; text-shadow: 0 0 12px rgba(251, 191, 36, 0.3); margin: 0; }
    .notice { font-size: 12px; color: #6ee7b7; margin-top: 8px; }
    .details { background-color: #051c16; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #0d3d30; font-size: 12px; line-height: 1.6; color: #cbd5e1; }
    .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 28px; border-top: 1px solid #0d3d30; pt: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Security & Access Control</div>
      <h1 class="title">Admin Authentication Code</h1>
      <p class="subtitle">US Goods PasaBuy • Privileged Team Portal</p>
    </div>

    <p style="font-size: 14px; color: #e2e8f0; line-height: 1.5;">
      Hello <strong>${fullName}</strong>,
    </p>
    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
      You have been invited to access the US Goods PasaBuy Admin Portal. Use the single-use 6-digit verification code below to authenticate your Gmail address and activate your administrator privileges.
    </p>

    <div class="code-box">
      <div class="code-label">One-Time Verification Code</div>
      <div class="code">${otpCode}</div>
      <div class="notice">Valid for ${expiresMinutes} minutes</div>
    </div>

    <div class="details">
      <strong>Security Notice:</strong>
      <br>• Do not share this authentication code with anyone.
      <br>• This grant enables full access to catalog landed costs, customer orders, and logistics pipelines.
      <br>• If you did not request this access, you may safely ignore this message.
    </div>

    <div class="footer">
      US Goods PasaBuy Importers • Oregon Tax-Free Hub & Manila Logistics
      <br>Head Administrator: Khin Andrei Gamboa (@khinag)
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Formats a premium emerald & navy branded HTML email for Customer Gmail OTP authentication
 */
export function getCustomerOtpEmailHtml(
  fullName: string,
  otpCode: string,
  expiresMinutes: number = 10
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #031510; color: #f1f5f9; margin: 0; padding: 24px; }
    .container { max-width: 540px; margin: 0 auto; background-color: #06241c; border: 1px solid #0d3d30; border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .header { text-align: center; margin-bottom: 24px; }
    .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
    .title { color: #ffffff; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0; }
    .subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
    .code-box { background: linear-gradient(135deg, #041a14 0%, #082a20 100%); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 16px; padding: 24px; text-align: center; margin: 26px 0; }
    .code-label { font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
    .code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #ffffff; text-shadow: 0 0 12px rgba(52, 211, 153, 0.3); margin: 0; }
    .notice { font-size: 12px; color: #a7f3d0; margin-top: 8px; }
    .perks { background-color: #051c16; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #0d3d30; font-size: 12px; line-height: 1.6; color: #cbd5e1; }
    .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 28px; border-top: 1px solid #0d3d30; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Customer Account Verification</div>
      <h1 class="title">Verify Your Gmail Address</h1>
      <p class="subtitle">US Goods PasaBuy • Direct US Outlets to Philippines</p>
    </div>

    <p style="font-size: 14px; color: #e2e8f0; line-height: 1.5;">
      Hi <strong>${fullName}</strong>,
    </p>
    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
      Welcome to US Goods PasaBuy! To complete your registration and protect your account, please enter the single-use 6-digit verification code below.
    </p>

    <div class="code-box">
      <div class="code-label">Your 6-Digit Verification Code</div>
      <div class="code">${otpCode}</div>
      <div class="notice">Code expires in ${expiresMinutes} minutes</div>
    </div>

    <div class="perks">
      <strong>✨ What you get with your verified account:</strong>
      <br>• 0% US Sales Tax via our tax-free Oregon hub
      <br>• Flexible 50% downpayment on high-demand US items
      <br>• Real-time courier tracking from US warehouse to your doorstep in the Philippines
    </div>

    <div class="footer">
      US Goods PasaBuy • If you did not request this verification code, please ignore this email.
    </div>
  </div>
</body>
</html>
  `.trim();
}


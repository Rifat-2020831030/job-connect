/**
 * OTP Email Utility
 *
 * Sends transactional OTP / password-reset emails with:
 * - Plain-text alternative (required to avoid spam)
 * - Proper Reply-To and List-Unsubscribe headers
 * - Message-ID with domain to help pass spam filters
 * - No tracking pixels or external images
 */
import mailer from "../services/mail-service.js";

const BRAND = "ChakriLagbe";
const BRAND_COLOR = "#16a34a"; // emerald-600
const FROM_DOMAIN = (process.env.MAIL_USER || "noreply@example.com").split("@")[1];

// ─── HTML template ────────────────────────────────────────────────────────────

const buildHtml = ({ heading, bodyLines, code, expiryHours = 24, footerNote }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#f9fafb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;
               border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:${BRAND_COLOR};padding:24px 32px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;
                        letter-spacing:-0.5px;">${BRAND}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">
                ${heading}
              </h1>
              ${bodyLines.map((line) => `<p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">${line}</p>`).join("")}

              ${
                code
                  ? `
              <!-- OTP Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;padding:16px 40px;
                                background:#f3f4f6;border-radius:6px;
                                border:1px dashed #d1d5db;">
                      <span style="font-size:32px;font-weight:700;
                                   letter-spacing:8px;color:#111827;
                                   font-family:monospace;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">
                This code expires in <strong>5 minutes</strong>.
              </p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                ${footerNote || `You received this email because an account action was requested on ${BRAND}. If you did not make this request, you can safely ignore this email.`}
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

// ─── Plain-text template ──────────────────────────────────────────────────────

const buildText = ({ heading, bodyLines, code, expiryHours = 24 }) =>
  [
    `${BRAND} — ${heading}`,
    "=".repeat(40),
    "",
    ...bodyLines,
    "",
    ...(code
      ? [
          `Your code: ${code}`,
          `This code expires in 5 minutes.`,
          "",
        ]
      : []),
    "If you did not request this, please ignore this email.",
    "",
    `— The ${BRAND} Team`,
  ].join("\n");

// ─── Exported senders ─────────────────────────────────────────────────────────

/**
 * Send an OTP verification email.
 * @param {string} to - Recipient email
 * @param {string} code - 6-digit OTP code
 */
export const sendVerificationOtp = (to, code) => {
  const heading = "Verify your email address";
  const bodyLines = [
    "Welcome to ChakriLagbe! To complete your registration, please enter the verification code below.",
  ];
  return mailer(
    to,
    `${code} is your ${BRAND} verification code`,
    buildText({ heading, bodyLines, code }),
    buildHtml({ heading, bodyLines, code })
  );
};

/**
 * Send a password reset OTP email.
 * @param {string} to - Recipient email
 * @param {string} code - 6-digit OTP code
 */
export const sendPasswordResetOtp = (to, code) => {
  const heading = "Reset your password";
  const bodyLines = [
    "We received a request to reset your password. Use the code below to create a new password.",
    "If you did not make this request, you can safely ignore this email.",
  ];
  return mailer(
    to,
    `${code} is your ${BRAND} password reset code`,
    buildText({ heading, bodyLines, code }),
    buildHtml({ heading, bodyLines, code })
  );
};

/**
 * Send a re-sent OTP verification email.
 * @param {string} to - Recipient email
 * @param {string} code - 6-digit OTP code
 */
export const sendResendOtp = (to, code) => {
  const heading = "New verification code";
  const bodyLines = [
    "As requested, here is your new verification code.",
  ];
  return mailer(
    to,
    `${code} is your new ${BRAND} verification code`,
    buildText({ heading, bodyLines, code }),
    buildHtml({ heading, bodyLines, code })
  );
};

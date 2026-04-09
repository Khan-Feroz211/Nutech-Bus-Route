import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string;
  resetLink: string;
}): Promise<void> {
  const from = process.env.SMTP_FROM;
  const tx = getTransporter();

  if (!tx || !from) {
    // Avoid leaking reset token in API response; log only in local development.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[password-reset] Email transport not configured. Reset link for ${input.to}: ${input.resetLink}`);
    }
    return;
  }

  await tx.sendMail({
    from,
    to: input.to,
    subject: 'NUTECH BusTrack Password Reset',
    text: `Hi ${input.name},\n\nUse the link below to reset your password:\n${input.resetLink}\n\nThis link expires in 15 minutes.\n\nIf you did not request this, you can safely ignore this email.`,
    html: `<p>Hi ${input.name},</p><p>Use the link below to reset your password:</p><p><a href="${input.resetLink}">${input.resetLink}</a></p><p>This link expires in <strong>15 minutes</strong>.</p><p>If you did not request this, you can safely ignore this email.</p>`,
  });
}

export async function sendEmailVerificationOtp(input: {
  to: string;
  name: string;
  otp: string;
}): Promise<void> {
  const from = process.env.SMTP_FROM;
  const tx = getTransporter();

  if (!tx || !from) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[email-verify] Email transport not configured. OTP for ${input.to}: ${input.otp}`);
    }
    return;
  }

  await tx.sendMail({
    from,
    to: input.to,
    subject: 'NUTECH BusTrack Email Verification OTP',
    text: `Hi ${input.name},\n\nYour email verification OTP is: ${input.otp}\n\nThis OTP expires in 5 minutes.\nIf you did not create this account, please ignore this email.`,
    html: `<p>Hi ${input.name},</p><p>Your email verification OTP is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px">${input.otp}</p><p>This OTP expires in <strong>5 minutes</strong>.</p><p>If you did not create this account, please ignore this email.</p>`,
  });
}

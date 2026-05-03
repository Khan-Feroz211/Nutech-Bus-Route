import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const allowInsecureTls = process.env.SMTP_ALLOW_INSECURE_TLS === 'true';

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    ...(allowInsecureTls ? { tls: { rejectUnauthorized: false } } : {}),
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

export async function sendWelcomeEmail(input: {
  to: string;
  name: string;
  role: string;
  routeName?: string;
}): Promise<void> {
  const from = process.env.SMTP_FROM;
  const tx = getTransporter();

  if (!tx || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[welcome] Email transport not configured. Welcome email for ${input.to}`);
    }
    return;
  }

  const roleText = input.role === 'student' ? 'Student' : input.role === 'driver' ? 'Driver' : 'Admin';
  const routeInfo = input.routeName ? `<p><strong>Assigned Route:</strong> ${input.routeName}</p>` : '';

  await tx.sendMail({
    from,
    to: input.to,
    subject: 'Welcome to NUTECH BusTrack! 🚌',
    text: `Hi ${input.name},\n\nWelcome to NUTECH BusTrack!\n\nYour account has been created as a ${roleText}.\n${input.routeName ? `You have been assigned to ${input.routeName}.` : ''}\n\nYou can now:\n- Track your bus in real-time\n- View schedules\n- Apply for bus passes\n- Get notifications about delays and arrivals\n\nLog in at: ${process.env.NEXTAUTH_URL}\n\nBest regards,\nNUTECH BusTrack Team`,
    html: `<p>Hi ${input.name},</p>
<h2>Welcome to NUTECH BusTrack! 🚌</h2>
<p>Your account has been created as a <strong>${roleText}</strong>.</p>
${routeInfo}
<p>You can now:</p>
<ul>
<li>Track your bus in real-time</li>
<li>View schedules</li>
<li>Apply for bus passes</li>
<li>Get notifications about delays and arrivals</li>
</ul>
<p><a href="${process.env.NEXTAUTH_URL}">Click here to log in</a></p>
<p>Best regards,<br>NUTECH BusTrack Team</p>`,
  });
}

export async function sendBusPassStatusEmail(input: {
  to: string;
  name: string;
  status: 'approved' | 'rejected';
  routeName?: string;
  reason?: string;
}): Promise<void> {
  const from = process.env.SMTP_FROM;
  const tx = getTransporter();

  if (!tx || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[bus-pass] Email transport not configured. Bus pass status for ${input.to}`);
    }
    return;
  }

  const statusColor = input.status === 'approved' ? '#10B981' : '#EF4444';
  const statusText = input.status === 'approved' ? 'Approved' : 'Rejected';
  const reasonText = input.reason ? `<p><strong>Reason:</strong> ${input.reason}</p>` : '';

  await tx.sendMail({
    from,
    to: input.to,
    subject: `NUTECH BusTrack - Bus Pass ${statusText}`,
    text: `Hi ${input.name},\n\nYour bus pass application has been ${statusText}.\n${input.routeName ? `Route: ${input.routeName}` : ''}\n${input.reason ? `Reason: ${input.reason}` : ''}\n\nLog in to check details: ${process.env.NEXTAUTH_URL}\n\nBest regards,\nNUTECH BusTrack Team`,
    html: `<p>Hi ${input.name},</p>
<h2>Bus Pass Application Update</h2>
<p>Your bus pass application has been <strong style="color:${statusColor}">${statusText}</strong>.</p>
${input.routeName ? `<p><strong>Route:</strong> ${input.routeName}</p>` : ''}
${reasonText}
<p><a href="${process.env.NEXTAUTH_URL}">Log in to view details</a></p>
<p>Best regards,<br>NUTECH BusTrack Team</p>`,
  });
}

export async function sendDelayNotificationEmail(input: {
  to: string;
  name: string;
  routeName: string;
  delayMinutes: number;
  newEta?: string;
}): Promise<void> {
  const from = process.env.SMTP_FROM;
  const tx = getTransporter();

  if (!tx || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[delay-notification] Email transport not configured. Delay notification for ${input.to}`);
    }
    return;
  }

  await tx.sendMail({
    from,
    to: input.to,
    subject: `⚠️ Bus Delay Alert - ${input.routeName}`,
    text: `Hi ${input.name},\n\nYour bus on ${input.routeName} is delayed by ${input.delayMinutes} minutes.\n${input.newEta ? `New ETA: ${input.newEta}` : ''}\n\nWe apologize for the inconvenience.\n\nBest regards,\nNUTECH BusTrack Team`,
    html: `<p>Hi ${input.name},</p>
<h2>⚠️ Bus Delay Alert</h2>
<p>Your bus on <strong>${input.routeName}</strong> is delayed by <strong>${input.delayMinutes} minutes</strong>.</p>
${input.newEta ? `<p><strong>New ETA:</strong> ${input.newEta}</p>` : ''}
<p>We apologize for the inconvenience.</p>
<p>Best regards,<br>NUTECH BusTrack Team</p>`,
  });
}

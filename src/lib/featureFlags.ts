export function shouldSkipEmailVerification(): boolean {
  const rawFlag = process.env.SKIP_EMAIL_VERIFICATION?.trim().toLowerCase();

  if (rawFlag === 'true') return true;
  if (rawFlag === 'false') return false;

  return process.env.NODE_ENV !== 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT_NAME);
}
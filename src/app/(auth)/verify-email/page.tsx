'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json() as { success?: boolean; error?: string; message?: string };

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Verification failed.');
        return;
      }

      setSuccess(data.message ?? 'Email verified successfully. Redirecting to login...');
      setTimeout(() => router.push('/login?verified=true'), 1200);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/send-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json() as { success?: boolean; error?: string; message?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Unable to resend OTP.');
        return;
      }

      setSuccess(data.message ?? 'OTP sent successfully.');
    } catch {
      setError('Network error while sending OTP.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutech-blue to-nutech-blue-light flex items-center justify-center p-4">

      <div className="w-full max-w-md animate-fade-up">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 border border-white/30">
          <h1 className="text-xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter the 6-digit OTP sent to your email to activate your account.
          </p>

          <form className="space-y-4 mt-5" onSubmit={handleVerify}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@nutech.edu.pk"
              required
            />
            <Input
              label="OTP Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              required
            />

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>}
            {success && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">{success}</p>}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Verify Email
            </Button>
          </form>

          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              onClick={handleResendOtp}
              disabled={resending || !email}
              className="text-nutech-blue font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
            <Link href="/login" className="text-gray-500 hover:text-gray-700 hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nutech-blue" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

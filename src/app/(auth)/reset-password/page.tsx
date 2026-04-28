'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token') ?? '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = (await res.json()) as { success: boolean; error?: string; message?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Unable to reset password.');
        return;
      }

      setMessage(data.message ?? 'Password reset successful. Redirecting to sign in...');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => router.push('/login'), 1200);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutech-blue to-nutech-blue-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-1">Set a new password for your student account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>Reset Password</Button>
        </form>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        {message && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{message}</p>}

        <p className="text-center text-sm text-gray-500">
          Back to{' '}
          <Link href="/login" className="text-nutech-blue font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-nutech-blue to-nutech-blue-light" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

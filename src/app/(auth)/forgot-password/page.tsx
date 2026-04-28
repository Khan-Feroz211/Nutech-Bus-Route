'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestToken(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = (await res.json()) as { success: boolean; error?: string; message?: string };

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Unable to issue reset token.');
      } else {
        setMessage(data.message ?? 'If the account exists, a reset link has been sent to your email.');
      }
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
          <h1 className="text-xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your roll number or email to receive a reset link.</p>
        </div>

        <form onSubmit={handleRequestToken} className="space-y-3">
          <Input
            label="Roll Number or Email"
            placeholder="Enter your roll number or official email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>Send Reset Link</Button>
        </form>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        {message && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{message}</p>}

        <p className="text-center text-sm text-gray-500">
          Remembered your password?{' '}
          <Link href="/login" className="text-nutech-blue font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

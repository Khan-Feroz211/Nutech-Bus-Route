'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrengthIndicator, PasswordRequirements } from '@/components/auth/PasswordStrengthIndicator';
import { generateSuggestedPassword } from '@/lib/passwordSecurity';
import { mockRoutes } from '@/lib/db';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    routeId: 'route-a',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleGeneratePassword() {
    const suggested = generateSuggestedPassword();
    setForm((f) => ({ ...f, password: suggested, confirmPassword: suggested }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      const data = (text ? JSON.parse(text) : {}) as {
        success?: boolean;
        error?: string;
        data?: { email?: string; verificationRequired?: boolean };
      };

      if (!res.ok || !data.success) {
        setError(data.error ?? `Registration failed (HTTP ${res.status}).`);
      } else {
        const verifiedEmail = data.data?.email ?? form.email.trim().toLowerCase();
        if (data.data?.verificationRequired) {
          router.push(`/verify-email?email=${encodeURIComponent(verifiedEmail)}`);
        } else {
          router.push('/login?registered=true');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutech-blue to-nutech-blue-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-nutech-blue font-black text-xl">N</span>
          </div>
          <h1 className="text-xl font-bold text-white">NUTECH BusTrack</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Student Registration</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Muhammad Ali" required />
            <Input label="Roll Number" name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="NUTECH-2023-XXX" required />
            <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="student@nutech.edu.pk" />
            <Input label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+92-300-XXXXXXX" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned Route</label>
              <select
                name="routeId"
                value={form.routeId}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue"
              >
                {mockRoutes.map((r) => (
                  <option key={r.id} value={r.id}>{r.label} – {r.area}</option>
                ))}
              </select>
            </div>

            {/* Password Requirements Display */}
            <PasswordRequirements />

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-xs text-nutech-blue hover:underline font-medium transition-colors"
                >
                  Generate Strong Password
                </button>
              </div>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
              
              {/* Real-time password strength indicator */}
              {form.password && (
                <div className="mt-3">
                  <PasswordStrengthIndicator password={form.password} showRequirements={true} />
                </div>
              )}
            </div>

            <Input label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-nutech-blue font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

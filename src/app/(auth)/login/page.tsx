'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { UserRole } from '@/types';

const ROLES: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: 'student', label: 'Student', icon: '🎓', desc: 'Roll number + password' },
  { value: 'driver', label: 'Driver', icon: '🚌', desc: 'Employee ID + PIN' },
  { value: 'admin', label: 'Admin', icon: '⚙️', desc: 'Email + password' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';

  const [role, setRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const placeholders: Record<UserRole, string> = {
    student: 'NUTECH-2023-001',
    driver: 'DRV-001',
    admin: 'admin@nutech.edu.pk',
  };

  const passwordLabels: Record<UserRole, string> = {
    student: 'Password',
    driver: 'PIN',
    admin: 'Password',
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      identifier,
      password,
      role,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid credentials. Please check your details and try again.');
    } else {
      if (role === 'driver') router.push('/driver');
      else if (role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-nutech-blue via-[#0E2A54] to-[#0A1E3F] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -right-16 w-80 h-80 rounded-full bg-[#00C2A8]/20 blur-3xl animate-pulse" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-white/20">
            <Image src="/nutech-logo.png" alt="NUTECH Logo" width={40} height={40} className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-white">NUTECH BusTrack</h1>
          <p className="text-white/70 text-sm mt-1">National University of Technology</p>
        </div>

        {registered && (
          <div className="mb-4 px-4 py-3 bg-green-500/20 border border-green-400/40 rounded-xl text-white text-sm text-center">
            Account created successfully. You can now sign in.
          </div>
        )}

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 animate-fade-up">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Sign In</h2>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => { setRole(r.value); setIdentifier(''); setError(''); }}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  role === r.value
                    ? 'border-nutech-blue bg-blue-50 text-nutech-blue shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{r.icon}</span>
                <span className="text-xs font-semibold">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={role === 'admin' ? 'Email' : role === 'driver' ? 'Employee ID' : 'Roll Number'}
              placeholder={placeholders[role]}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
            />
            <Input
              label={passwordLabels[role]}
              type="password"
              placeholder={role === 'driver' ? '••••' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Sign In
            </Button>

            <div className="flex items-center justify-between text-sm pt-1">
              <Link href="/register" className="text-nutech-blue font-medium hover:underline">
                Create Account
              </Link>
              <Link href="/forgot-password" className="text-gray-500 hover:text-gray-700 hover:underline">
                Forgot Password?
              </Link>
            </div>
          </form>

          <div className="mt-5 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>Student: <span className="font-mono">NUTECH-2023-001</span> / <span className="font-mono">student123</span></p>
              <p>Driver: <span className="font-mono">DRV-001</span> / <span className="font-mono">1234</span></p>
              <p>Admin: <span className="font-mono">admin@nutech.edu.pk</span> / <span className="font-mono">admin123</span></p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-4">
          © {new Date().getFullYear()} NUTECH University, Islamabad
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-nutech-blue to-nutech-blue-light flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

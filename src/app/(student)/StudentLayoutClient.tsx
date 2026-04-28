'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/shared/Navbar';
import { NotificationPrompt } from '@/components/shared/NotificationPrompt';
import { Loader2 } from 'lucide-react';

export default function StudentLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [mounted, status, router]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) return null;

  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'student') {
    if (role === 'driver') router.push('/driver');
    else if (role === 'admin') router.push('/admin');
    else router.push('/login');
    return null;
  }

  return (
    <div>
      <Navbar />
      <main className="page-content">{children}</main>
      <NotificationPrompt />
    </div>
  );
}

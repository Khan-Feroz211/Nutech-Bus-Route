import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as Record<string, unknown>)?.role as string;

  if (role === 'driver') redirect('/driver');
  if (role === 'admin') redirect('/admin');
  redirect('/dashboard');
}

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import StudentLayoutClient from './StudentLayoutClient';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect('/login');

  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'student') {
    if (role === 'driver') redirect('/driver');
    if (role === 'admin') redirect('/admin');
    redirect('/login');
  }

  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}

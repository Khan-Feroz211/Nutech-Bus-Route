import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Navbar from '@/components/shared/Navbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin') redirect('/login');

  return (
    <div>
      <Navbar />
      <main className="page-content">{children}</main>
    </div>
  );
}

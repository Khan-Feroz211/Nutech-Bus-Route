'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockRoutes } from '@/lib/db';

interface BusPassApp {
  id: string;
  semester: string;
  routeId: string;
  status: 'pending' | 'approved' | 'rejected';
  feeStatus: 'unpaid' | 'paid';
  feeAmount: number;
  appliedAt: string;
  validFrom?: string;
  validTo?: string;
}

const SEMESTERS = ['Spring 2025', 'Fall 2025', 'Spring 2026'];

export default function BusPassPage() {
  const { data: session } = useSession();
  const studentId = (session?.user as Record<string, unknown>)?.id as string;
  const assignedRouteId = (session?.user as Record<string, unknown>)?.assignedRouteId as string ?? 'route-a';

  const [myApps, setMyApps] = useState<BusPassApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [routeId, setRouteId] = useState(assignedRouteId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function fetchApps() {
    if (!studentId) return;
    try {
      const res = await fetch(`/api/bus-pass?studentId=${studentId}`);
      const data = await res.json();
      if (data.success) setMyApps(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchApps(); }, [studentId]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setApplying(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/bus-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, routeId, semester, feeAmount: 5000 }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Application submitted! Admin will review it shortly.');
        fetchApps();
      } else {
        setError(data.error ?? 'Failed to submit application.');
      }
    } finally {
      setApplying(false);
    }
  }

  const activePass = myApps.find((a) => a.status === 'approved');
  const pendingApp = myApps.find((a) => a.status === 'pending');

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Bus Pass</h1>
        <p className="text-sm text-gray-500 mt-0.5">Apply for or manage your bus pass</p>
      </div>

      {/* Active pass */}
      {activePass && (
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">🎫</div>
            <div>
              <p className="font-bold text-gray-900">Bus Pass Active</p>
              <p className="text-sm text-gray-500">{activePass.semester}</p>
            </div>
            <div className="ml-auto">
              <Badge variant={activePass.feeStatus === 'paid' ? 'success' : 'warning'}>
                Fee {activePass.feeStatus}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Route</p>
              <p className="font-semibold">{mockRoutes.find((r) => r.id === activePass.routeId)?.label ?? activePass.routeId}</p>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Fee</p>
              <p className="font-semibold">PKR {activePass.feeAmount.toLocaleString()}</p>
            </div>
            {activePass.validFrom && (
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Valid From</p>
                <p className="font-semibold">{new Date(activePass.validFrom).toLocaleDateString()}</p>
              </div>
            )}
            {activePass.validTo && (
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Expires</p>
                <p className="font-semibold">{new Date(activePass.validTo).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          {activePass.feeStatus === 'unpaid' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ Your bus pass fee of PKR {activePass.feeAmount.toLocaleString()} is <strong>unpaid</strong>. Please pay at the transport office.
            </div>
          )}
        </Card>
      )}

      {/* Pending application */}
      {pendingApp && (
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl">⏳</div>
            <div>
              <p className="font-semibold text-gray-900">Application Under Review</p>
              <p className="text-sm text-gray-500">{pendingApp.semester} · {mockRoutes.find((r) => r.id === pendingApp.routeId)?.label}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">Your bus pass application is being reviewed by the admin. You will be notified once approved.</p>
        </Card>
      )}

      {/* Apply form */}
      {!activePass && !pendingApp && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Apply for Bus Pass</h2>

          {error && <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
          {success && <div className="mb-3 p-3 bg-green-50 text-green-700 text-sm rounded-lg">{success}</div>}

          <form onSubmit={handleApply} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue"
              >
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Route</label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue"
              >
                {mockRoutes.map((r) => <option key={r.id} value={r.id}>{r.label} – {r.area}</option>)}
              </select>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-nutech-blue">
              📋 Bus pass fee: <strong>PKR 5,000 / semester</strong> — payable at the transport office after approval.
            </div>
            <Button type="submit" className="w-full" loading={applying}>
              Submit Application
            </Button>
          </form>
        </Card>
      )}

      {/* History - all past (non-pending, non-active) applications */}
      {myApps.filter((a) => a.status !== 'pending' && a !== activePass).length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">Past Applications</h2>
          <div className="space-y-2">
            {myApps.filter((a) => a.status !== 'pending' && a !== activePass).map((app) => (
              <div key={app.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{app.semester} · {mockRoutes.find((r) => r.id === app.routeId)?.label}</span>
                <Badge variant={app.status === 'approved' ? 'success' : 'danger'}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

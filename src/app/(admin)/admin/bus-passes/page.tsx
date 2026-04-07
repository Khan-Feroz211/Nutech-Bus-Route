'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockRoutes } from '@/lib/db';
import { formatTime } from '@/lib/utils';

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
  notes?: string;
  student: { id: string; name: string; rollNumber: string; email?: string; phoneNumber?: string };
}

export default function AdminBusPassesPage() {
  const [apps, setApps] = useState<BusPassApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(statusFilter ? { status: statusFilter } : {});
      const res = await fetch(`/api/bus-pass?${params}`);
      const data = await res.json();
      if (data.success) setApps(data.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  async function updateApp(id: string, updates: Record<string, unknown>) {
    setUpdating(id);
    try {
      await fetch('/api/bus-pass', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      fetchApps();
    } finally {
      setUpdating(null);
    }
  }

  const feeTotal = apps.filter((a) => a.feeStatus === 'paid').reduce((sum, a) => sum + a.feeAmount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bus Pass Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {apps.length} applications · Fees collected: PKR {feeTotal.toLocaleString()}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : apps.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-gray-500">No {statusFilter} applications.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const route = mockRoutes.find((r) => r.id === app.routeId);
            const expanded = expandedId === app.id;
            return (
              <Card key={app.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{app.student.name}</p>
                      <span className="text-xs text-gray-400">{app.student.rollNumber}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      {route && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: route.color }} />
                          {route.label}
                        </span>
                      )}
                      <span>· {app.semester}</span>
                      <span>· PKR {app.feeAmount.toLocaleString()}</span>
                      <span>· Applied {formatTime(app.appliedAt)}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                        {app.status}
                      </Badge>
                      <Badge variant={app.feeStatus === 'paid' ? 'success' : 'default'}>
                        Fee: {app.feeStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateApp(app.id, {
                            status: 'approved',
                            validFrom: new Date().toISOString(),
                            validTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
                          })}
                          loading={updating === app.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => updateApp(app.id, { status: 'rejected' })}
                          loading={updating === app.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {app.status === 'approved' && app.feeStatus === 'unpaid' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateApp(app.id, { feeStatus: 'paid' })}
                        loading={updating === app.id}
                      >
                        Mark Fee Paid
                      </Button>
                    )}
                    <button
                      onClick={() => setExpandedId(expanded ? null : app.id)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      {expanded ? 'Hide ▲' : 'Details ▼'}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div><span className="font-medium">Email:</span> {app.student.email ?? '—'}</div>
                    <div><span className="font-medium">Phone:</span> {app.student.phoneNumber ?? '—'}</div>
                    {app.validFrom && <div><span className="font-medium">Valid From:</span> {new Date(app.validFrom).toLocaleDateString()}</div>}
                    {app.validTo && <div><span className="font-medium">Valid To:</span> {new Date(app.validTo).toLocaleDateString()}</div>}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

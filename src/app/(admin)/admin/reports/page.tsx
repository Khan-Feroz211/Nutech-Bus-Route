'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTime } from '@/lib/utils';

interface Report {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  student: { name: string; rollNumber: string };
}

const TYPE_LABELS: Record<string, string> = {
  delay: 'Bus Delay',
  driver_behavior: 'Driver Behavior',
  bus_condition: 'Bus Condition',
  route_issue: 'Route Issue',
  safety: 'Safety Concern',
  other: 'Other',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.success) setReports(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  async function updateStatus(id: string, status: 'resolved' | 'dismissed') {
    setUpdating(id);
    try {
      await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchReports();
    } finally {
      setUpdating(null);
    }
  }

  const filtered = reports.filter((r) => !statusFilter || r.status === statusFilter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Student Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} {statusFilter || 'total'} reports</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-gray-500">No {statusFilter} reports.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => (
            <Card key={report.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {TYPE_LABELS[report.type] ?? report.type}
                    </span>
                    <Badge variant={report.status === 'pending' ? 'warning' : report.status === 'resolved' ? 'success' : 'default'}>
                      {report.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-800">{report.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {report.student.name} ({report.student.rollNumber}) · {formatTime(report.createdAt)}
                  </p>
                </div>
                {report.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      disabled={updating === report.id}
                      className="text-xs text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {updating === report.id ? '…' : 'Resolve'}
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'dismissed')}
                      disabled={updating === report.id}
                      className="text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mockRoutes } from '@/lib/db';
import { formatTime } from '@/lib/utils';

interface DBNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  targetRole?: string;
  routeId?: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'route'>('all');
  const [routeId, setRouteId] = useState('route-a');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [announcements, setAnnouncements] = useState<DBNotification[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const sysNotifs = (data.data as DBNotification[]).filter(
          (n) => n.type === 'system' || n.targetRole === 'all'
        );
        setAnnouncements(sysNotifs);
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          type: 'system',
          targetRole: target === 'all' ? 'all' : undefined,
          routeId: target === 'route' ? routeId : undefined,
        }),
      });
      setSent(true);
      setTitle('');
      setMessage('');
      fetchAnnouncements();
      setTimeout(() => setSent(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Announcements</h1>

      {/* Send announcement */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Send Announcement</h2>
        {sent && (
          <div className="mb-3 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
            ✅ Announcement sent successfully!
          </div>
        )}
        <form onSubmit={handleSend} className="space-y-3">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Schedule Change Tomorrow"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              required
              placeholder="Your announcement message…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  value="all"
                  checked={target === 'all'}
                  onChange={() => setTarget('all')}
                  className="text-nutech-blue"
                />
                <span className="text-sm">All Students</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  value="route"
                  checked={target === 'route'}
                  onChange={() => setTarget('route')}
                  className="text-nutech-blue"
                />
                <span className="text-sm">Specific Route</span>
              </label>
            </div>
          </div>

          {target === 'route' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Route</label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue"
              >
                {mockRoutes.map((r) => (
                  <option key={r.id} value={r.id}>{r.label} – {r.area}</option>
                ))}
              </select>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            📢 Send Announcement
          </Button>
        </form>
      </Card>

      {/* Past announcements */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">
          Recent Announcements
          {announcements.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">({announcements.length})</span>
          )}
        </h2>
        {loadingList ? (
          <div className="text-center py-6 text-gray-400 text-sm">Loading…</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-1">📢</p>
            <p className="text-sm text-gray-500">No announcements yet. Send one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((notif) => (
              <div key={notif.id} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(new Date(notif.createdAt))}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                {notif.routeId && (
                  <p className="text-xs text-blue-500 mt-1">
                    Route: {mockRoutes.find((r) => r.id === notif.routeId)?.label ?? notif.routeId}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

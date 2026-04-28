'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { mockRoutes, mockDrivers } from '@/lib/db';
import { getBusStatusLabel } from '@/lib/utils';

interface BusRecord {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: string;
  routeId?: string;
  driverId?: string;
}

const STATUS_OPTIONS = ['idle', 'active', 'maintenance', 'offline'];

const statusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
  switch (status) {
    case 'active': return 'success';
    case 'idle': return 'warning';
    case 'maintenance':
    case 'offline': return 'danger';
    default: return 'default';
  }
};

const emptyForm = {
  plateNumber: '',
  model: '',
  capacity: '45',
  status: 'idle',
  routeId: '',
  driverId: '',
};

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<BusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBus, setEditBus] = useState<BusRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/buses');
      const data = await res.json();
      if (data.success) setBuses(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBuses(); }, [fetchBuses]);

  function openAdd() {
    setForm(emptyForm);
    setEditBus(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(bus: BusRecord) {
    setForm({
      plateNumber: bus.plateNumber,
      model: bus.model,
      capacity: String(bus.capacity),
      status: bus.status,
      routeId: bus.routeId ?? '',
      driverId: bus.driverId ?? '',
    });
    setEditBus(bus);
    setError('');
    setShowForm(true);
  }

  function flash(msg: string, type: 'success' | 'error' = 'success') {
    setFlashMsg({ type, text: msg });
    setTimeout(() => setFlashMsg(null), 3500);
  }

  async function handleSave() {
    if (!form.plateNumber || !form.model || !form.capacity) {
      setError('Plate number, model, and capacity are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editBus) {
        const res = await fetch('/api/buses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editBus.id,
            model: form.model,
            capacity: Number(form.capacity),
            status: form.status,
            routeId: form.routeId || null,
            driverId: form.driverId || null,
          }),
        });
        const data = await res.json();
        if (!data.success) { setError(data.error ?? 'Failed to update bus.'); return; }
        flash('Bus updated successfully!');
      } else {
        const res = await fetch('/api/buses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plateNumber: form.plateNumber,
            model: form.model,
            capacity: Number(form.capacity),
            routeId: form.routeId || undefined,
            driverId: form.driverId || undefined,
          }),
        });
        const data = await res.json();
        if (!data.success) { setError(data.error ?? 'Failed to add bus.'); return; }
        flash('Bus added successfully!');
      }
      setShowForm(false);
      fetchBuses();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this bus? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await fetch('/api/buses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      flash('Bus deleted.');
      fetchBuses();
    } finally {
      setDeleting(null);
    }
  }

  async function quickStatus(id: string, status: string) {
    try {
      const res = await fetch('/api/buses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!data.success) { flash('Failed to update status. Please try again.', 'error'); return; }
      fetchBuses();
    } catch {
      flash('Network error. Could not update status.', 'error');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bus Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{buses.length} buses registered</p>
        </div>
        <Button size="sm" onClick={openAdd}>+ Add Bus</Button>
      </div>

      {flashMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${
          flashMsg.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {flashMsg.type === 'success' ? '✅' : '❌'} {flashMsg.text}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">{editBus ? 'Edit Bus' : 'Add New Bus'}</h2>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3 border border-red-200">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Plate Number *"
              value={form.plateNumber}
              onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
              disabled={!!editBus}
              placeholder="ISB-005"
            />
            <Input
              label="Model *"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              placeholder="Hino Coach 2023"
            />
            <Input
              label="Capacity *"
              type="number"
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              placeholder="45"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue min-h-[44px]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{getBusStatusLabel(s)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Route</label>
              <select
                value={form.routeId}
                onChange={(e) => setForm((f) => ({ ...f, routeId: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue min-h-[44px]"
              >
                <option value="">— None —</option>
                {mockRoutes.map((r) => (
                  <option key={r.id} value={r.id}>{r.label} – {r.area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Driver</label>
              <select
                value={form.driverId}
                onChange={(e) => setForm((f) => ({ ...f, driverId: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue min-h-[44px]"
              >
                <option value="">— None —</option>
                {mockDrivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.employeeId})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} loading={saving}>
              {editBus ? 'Save Changes' : 'Add Bus'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Bus list */}
      <Card padding="none">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading buses…</div>
        ) : buses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🚌</p>
            <p className="text-gray-500">No buses registered yet.</p>
            <button onClick={openAdd} className="mt-3 text-sm text-nutech-blue hover:underline">
              Add your first bus →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bus</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {buses.map((bus) => {
                  const route = mockRoutes.find((r) => r.id === bus.routeId);
                  const driver = mockDrivers.find((d) => d.id === bus.driverId);
                  return (
                    <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{bus.plateNumber}</p>
                        <p className="text-xs text-gray-500">{bus.model}</p>
                      </td>
                      <td className="px-4 py-3">
                        {route ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: route.color }} />
                            <span className="text-gray-700">{route.label}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {driver ? (
                          <div>
                            <p className="text-gray-800">{driver.name}</p>
                            <p className="text-xs text-gray-500">{driver.employeeId}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{bus.capacity}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariant(bus.status)}>
                          {bus.status === 'active' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block mr-1" />
                          )}
                          {getBusStatusLabel(bus.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => openEdit(bus)}
                            className="text-xs text-nutech-blue hover:underline"
                          >
                            Edit
                          </button>
                          {bus.status !== 'active' && (
                            <button
                              onClick={() => quickStatus(bus.id, 'active')}
                              className="text-xs text-green-600 hover:underline"
                            >
                              Set Active
                            </button>
                          )}
                          {bus.status === 'active' && (
                            <button
                              onClick={() => quickStatus(bus.id, 'idle')}
                              className="text-xs text-yellow-600 hover:underline"
                            >
                              Set Idle
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(bus.id)}
                            disabled={deleting === bus.id}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            {deleting === bus.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

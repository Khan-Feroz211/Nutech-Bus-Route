'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mockRoutes } from '@/lib/db';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  assignedRouteId?: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Add/edit form state
  const [form, setForm] = useState({ name: '', rollNumber: '', email: '', phoneNumber: '', address: '', assignedRouteId: 'route-a', password: 'student123' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, routeId: routeFilter, limit: '50' });
      const res = await fetch(`/api/students?${params}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data.students);
        setTotal(data.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [search, routeFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  function openAdd() {
    setForm({ name: '', rollNumber: '', email: '', phoneNumber: '', address: '', assignedRouteId: 'route-a', password: 'student123' });
    setEditStudent(null);
    setShowAdd(true);
    setError('');
  }

  function openEdit(s: Student) {
    setForm({ name: s.name, rollNumber: s.rollNumber ?? '', email: s.email ?? '', phoneNumber: s.phoneNumber ?? '', address: s.address ?? '', assignedRouteId: s.assignedRouteId ?? 'route-a', password: '' });
    setEditStudent(s);
    setShowAdd(true);
    setError('');
  }

  async function handleSave() {
    if (!form.name || !form.rollNumber || !form.assignedRouteId) {
      setError('Name, roll number, and route are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const method = editStudent ? 'PATCH' : 'POST';
      const body = editStudent
        ? { id: editStudent.id, name: form.name, email: form.email, phoneNumber: form.phoneNumber, address: form.address, assignedRouteId: form.assignedRouteId }
        : { ...form };
      const res = await fetch('/api/students', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) { setError(data.error ?? 'Error saving student.'); return; }
      setShowAdd(false);
      fetchStudents();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this student? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await fetch('/api/students', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      fetchStudents();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} registered students</p>
        </div>
        <Button size="sm" onClick={openAdd}>+ Add Student</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, roll number or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue"
        >
          <option value="">All Routes</option>
          {mockRoutes.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Add/Edit modal */}
      {showAdd && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">{editStudent ? 'Edit Student' : 'Add Student'}</h2>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Full Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Roll Number *" value={form.rollNumber} onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))} disabled={!!editStudent} />
            <Input label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label="Phone" value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} />
            <Input label="Address / Pickup Stop" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Route *</label>
              <select
                value={form.assignedRouteId}
                onChange={(e) => setForm((f) => ({ ...f, assignedRouteId: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue"
              >
                {mockRoutes.map((r) => (
                  <option key={r.id} value={r.id}>{r.label} – {r.area}</option>
                ))}
              </select>
            </div>
            {!editStudent && (
              <Input label="Initial Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} loading={saving}>{editStudent ? 'Save Changes' : 'Add Student'}</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No.</th>
                  <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                  const route = mockRoutes.find((r) => r.id === student.assignedRouteId);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-nutech-blue flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 font-mono text-xs">{student.rollNumber}</td>
                      <td className="py-3 pr-4">
                        {route && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: route.color }} />
                            <span className="text-gray-700">{route.label}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">{student.phoneNumber ?? '—'}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(student)} className="text-xs text-nutech-blue hover:underline">Edit</button>
                          <button onClick={() => handleDelete(student.id)} disabled={deleting === student.id} className="text-xs text-red-600 hover:underline disabled:opacity-50">
                            {deleting === student.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {students.length === 0 && (
              <p className="text-center text-gray-400 py-8">No students found.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

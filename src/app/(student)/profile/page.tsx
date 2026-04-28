'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mockRoutes, mockStudents } from '@/lib/db';

export default function ProfilePage() {
  const { data: session } = useSession();
  const userId = (session?.user as Record<string, unknown>)?.id as string;
  const assignedRouteId = (session?.user as Record<string, unknown>)?.assignedRouteId as string ?? 'route-a';

  const student = mockStudents.find((s) => s.id === userId) ?? mockStudents[0];
  const route = mockRoutes.find((r) => r.id === assignedRouteId) ?? mockRoutes[0];

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(student.phoneNumber ?? '');
  const [address, setAddress] = useState(student.address ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSave() {
    if (!userId) { setSaveMsg({ type: 'error', text: 'Session expired. Please sign in again.' }); return; }
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, phoneNumber: phone, address }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg({ type: 'success', text: 'Profile updated successfully!' });
        setEditing(false);
      } else {
        setSaveMsg({ type: 'error', text: data.error ?? 'Failed to save changes.' });
      }
    } catch {
      setSaveMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">My Profile</h1>

      {saveMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          saveMsg.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {saveMsg.type === 'success' ? '✅ ' : '❌ '}{saveMsg.text}
        </div>
      )}

      {/* Avatar card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-nutech-blue flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">
              {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{student.name}</h2>
            <p className="text-sm text-gray-500">{student.rollNumber}</p>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
          <span className="text-xs bg-nutech-blue/10 text-nutech-blue px-2.5 py-1 rounded-full font-medium capitalize">
            Student
          </span>
        </div>
      </Card>

      {/* Route info */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">Assigned Route</h3>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: route.color }}
          >
            {route.label.replace('Route ', '')}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{route.label} – {route.name}</p>
            <p className="text-sm text-gray-500">{route.area} · {route.totalStops} stops</p>
            <p className="text-xs text-gray-400 mt-0.5">
              🌅 {route.morningDeparture} &nbsp; 🌆 {route.eveningDeparture}
            </p>
          </div>
        </div>
      </Card>

      {/* Contact info */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Contact Info</h3>
          <button
            onClick={() => { setEditing((e) => !e); setSaveMsg(null); }}
            className="text-sm text-nutech-blue hover:underline"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92-300-XXXXXXX"
            />
            <Input
              label="Home Address / Pickup Stop"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your neighbourhood"
            />
            <Button
              onClick={handleSave}
              className="w-full"
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <InfoRow label="Phone" value={phone || 'Not set'} />
            <InfoRow label="Address" value={address || 'Not set'} />
            <InfoRow label="Email" value={student.email ?? 'Not set'} />
          </div>
        )}
      </Card>

      {/* App info */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">App Info</h3>
        <div className="space-y-2 text-sm">
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="University" value="NUTECH, Islamabad" />
        </div>
      </Card>

      <Button
        variant="danger"
        className="w-full"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        Sign Out
      </Button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}

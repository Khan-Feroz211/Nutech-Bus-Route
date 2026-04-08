'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ReportType } from '@/types';

const REPORT_TYPES: { value: ReportType; label: string; icon: string }[] = [
  { value: 'delay', label: 'Bus Delay', icon: '⏱️' },
  { value: 'driver_behavior', label: 'Driver Behavior', icon: '🚗' },
  { value: 'bus_condition', label: 'Bus Condition', icon: '🔧' },
  { value: 'route_issue', label: 'Route Issue', icon: '🗺️' },
  { value: 'safety', label: 'Safety Concern', icon: '⚠️' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export default function ReportPage() {
  const { data: session } = useSession();
  const [type, setType] = useState<ReportType>('delay');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);

    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          description,
          studentId: (session?.user as Record<string, unknown>)?.id,
        }),
      });
      setSubmitted(true);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h2>
        <p className="text-gray-500 text-sm mb-6">
          Thank you for your report. Our team will review it and take appropriate action.
        </p>
        <Button onClick={() => { setSubmitted(false); setDescription(''); }}>
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Report Issue</h1>
        <p className="text-sm text-gray-500 mt-0.5">Help us improve your bus experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Issue type */}
        <Card>
          <p className="text-sm font-medium text-gray-700 mb-3">Issue Type</p>
          <div className="grid grid-cols-2 gap-2">
            {REPORT_TYPES.map((rt) => (
              <button
                key={rt.value}
                type="button"
                onClick={() => setType(rt.value)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${
                  type === rt.value
                    ? 'border-nutech-blue bg-blue-50 text-nutech-blue'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{rt.icon}</span>
                <span className="text-sm font-medium">{rt.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Description */}
        <Card>
          <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue in detail…"
            rows={4}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nutech-blue resize-none"
          />
        </Card>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Submit Report
        </Button>
      </form>
    </div>
  );
}

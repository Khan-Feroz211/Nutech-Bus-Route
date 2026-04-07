'use client';

import { Card } from '@/components/ui/Card';
import { mockStudents, mockRoutes } from '@/lib/db';

export default function AdminStudentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mockStudents.length} registered students</p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No.</th>
                <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockStudents.map((student) => {
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
                    <td className="py-3 text-gray-500 text-xs">{student.phoneNumber ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

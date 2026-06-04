import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { getAdminMetrics } from '../backend/getAdminMetrics';
import type { AdminMetrics } from '../backend/getAdminMetrics';

export function AdminDashboard(): JSX.Element {
  const [metrics, setMetrics] = useState<AdminMetrics | null | 'loading'>('loading');

  useEffect(() => {
    getAdminMetrics().then(setMetrics);
  }, []);

  if (metrics === 'loading') {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-paper dark:bg-ink text-ink dark:text-paper"
        data-testid="admin-dashboard-loading"
      >
        Loading…
      </div>
    );
  }

  if (metrics === null) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-paper dark:bg-ink text-ink dark:text-paper"
        data-testid="admin-dashboard-unavailable"
      >
        Metrics unavailable
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-paper dark:bg-ink text-ink dark:text-paper px-4 py-8"
      data-testid="admin-dashboard"
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <h1 className="text-2xl font-bold">Admin Metrics</h1>

        <div className="flex gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Unique Players</span>
            <span className="text-3xl font-semibold" data-testid="metric-unique-players">
              {metrics.unique_players}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</span>
            <span className="text-3xl font-semibold" data-testid="metric-total-submissions">
              {metrics.total_submissions}
            </span>
          </div>
        </div>

        {metrics.by_day.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-semibold">Per Day (last 90 days)</h2>
            <table className="w-full text-sm border-collapse" data-testid="metric-by-day-table">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 pr-4 font-medium">Day</th>
                  <th className="pb-2 pr-4 font-medium">Players</th>
                  <th className="pb-2 font-medium">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {metrics.by_day.map((row) => (
                  <tr
                    key={row.day}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-2 pr-4">{row.day}</td>
                    <td className="py-2 pr-4">{row.players}</td>
                    <td className="py-2">{row.submissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

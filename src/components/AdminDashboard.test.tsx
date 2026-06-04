import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminDashboard } from './AdminDashboard';

const state = vi.hoisted(() => ({
  metrics: null as import('../backend/getAdminMetrics').AdminMetrics | null | 'loading',
}));

vi.mock('../backend/getAdminMetrics', () => ({
  getAdminMetrics: vi.fn(async () => {
    if (state.metrics === 'loading') return new Promise(() => {});
    return state.metrics;
  }),
}));

const VALID_METRICS = {
  unique_players: 42,
  total_submissions: 150,
  by_day: [
    { day: '2026-06-03', players: 10, submissions: 30 },
    { day: '2026-06-02', players: 8, submissions: 25 },
  ],
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while fetch is in flight', async () => {
    state.metrics = 'loading';
    render(<AdminDashboard />);
    expect(screen.getByTestId('admin-dashboard-loading')).toBeInTheDocument();
  });

  it('shows "Metrics unavailable" when getAdminMetrics returns null', async () => {
    state.metrics = null;
    render(<AdminDashboard />);
    await waitFor(() =>
      expect(screen.getByTestId('admin-dashboard-unavailable')).toBeInTheDocument(),
    );
    expect(screen.getByText(/metrics unavailable/i)).toBeInTheDocument();
  });

  it('renders unique players and total submissions', async () => {
    state.metrics = VALID_METRICS;
    render(<AdminDashboard />);
    await waitFor(() => expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument());
    expect(screen.getByTestId('metric-unique-players').textContent).toBe('42');
    expect(screen.getByTestId('metric-total-submissions').textContent).toBe('150');
  });

  it('renders per-day table with newest first', async () => {
    state.metrics = VALID_METRICS;
    render(<AdminDashboard />);
    await waitFor(() => expect(screen.getByTestId('metric-by-day-table')).toBeInTheDocument());
    const rows = screen.getAllByRole('row');
    // rows[0] = header, rows[1] = first data row (newest)
    expect(rows[1]).toHaveTextContent('2026-06-03');
    expect(rows[2]).toHaveTextContent('2026-06-02');
  });

  it('does not render the per-day table when by_day is empty', async () => {
    state.metrics = { unique_players: 0, total_submissions: 0, by_day: [] };
    render(<AdminDashboard />);
    await waitFor(() => expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument());
    expect(screen.queryByTestId('metric-by-day-table')).toBeNull();
  });
});

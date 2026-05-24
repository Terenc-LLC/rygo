import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatsScreen } from './StatsScreen';
import App from '../App';
import { recordDailyResult } from '../persistence/dailyState';

const TODAY = '2026-05-24';
const TODAY_MS = new Date('2026-05-24T12:00:00Z').getTime();

describe('StatsScreen', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(TODAY_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a card for each of the four levels', () => {
    render(<StatsScreen onBack={() => {}} />);
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Extreme')).toBeInTheDocument();
  });

  it('shows empty-state copy for all unplayed levels', () => {
    render(<StatsScreen onBack={() => {}} />);
    const empties = screen.getAllByText('No plays yet — try it!');
    expect(empties).toHaveLength(4);
  });

  it('shows empty-state only for unplayed levels when some have data', () => {
    recordDailyResult(4, TODAY, { moves: 10, elapsedMs: 5000 });
    render(<StatsScreen onBack={() => {}} />);
    // Three unplayed
    const empties = screen.getAllByText('No plays yet — try it!');
    expect(empties).toHaveLength(3);
  });

  it('shows today-vs-best line when today is played', () => {
    recordDailyResult(4, TODAY, { moves: 10, elapsedMs: 5000 });
    render(<StatsScreen onBack={() => {}} />);
    expect(screen.getByText(/Today: 10 moves/)).toBeInTheDocument();
  });

  it('shows "New best!" when today equals best score', () => {
    recordDailyResult(4, TODAY, { moves: 10, elapsedMs: 5000 });
    render(<StatsScreen onBack={() => {}} />);
    expect(screen.getByText('New best!')).toBeInTheDocument();
  });

  it('shows delta cue when today is above best score', () => {
    // First play yesterday (best = 8), then today = 12 (above best)
    recordDailyResult(4, '2026-05-23', { moves: 8, elapsedMs: 4000 });
    recordDailyResult(4, TODAY, { moves: 12, elapsedMs: 6000 });
    render(<StatsScreen onBack={() => {}} />);
    expect(screen.getByText('+4 from your best')).toBeInTheDocument();
  });

  it('shows not-played-today for a level with history but no today entry', () => {
    recordDailyResult(4, '2026-05-23', { moves: 8, elapsedMs: 4000 });
    render(<StatsScreen onBack={() => {}} />);
    expect(screen.getByText('Not played today')).toBeInTheDocument();
  });

  it('shows play-today invite when streak is zero', () => {
    render(<StatsScreen onBack={() => {}} />);
    expect(screen.getByText('Play today to start a streak')).toBeInTheDocument();
  });

  it('shows streak header when streak > 0', () => {
    recordDailyResult(4, TODAY, { moves: 10, elapsedMs: 5000 });
    render(<StatsScreen onBack={() => {}} />);
    expect(screen.getByText(/🔥.*-day streak/)).toBeInTheDocument();
  });

  it('calls onBack when the Back button is clicked', () => {
    const onBack = vi.fn();
    render(<StatsScreen onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /back to difficulty picker/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

describe('Stats routing (App integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(TODAY_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('stats button on DifficultyPicker navigates to stats screen', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /show stats/i }));
    expect(screen.getByRole('heading', { name: 'Stats' })).toBeInTheDocument();
  });

  it('Back button on StatsScreen returns to difficulty picker', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /show stats/i }));
    fireEvent.click(screen.getByRole('button', { name: /back to difficulty picker/i }));
    // Back on difficulty picker: RYGO lockup should be visible again
    expect(screen.getAllByAltText('RYGO')[0]).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });
});

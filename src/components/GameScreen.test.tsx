import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameScreen, IN_PROGRESS_KEY } from './GameScreen';
import type { GeneratedPuzzle } from '../engine/generator';
import type { Board } from '../engine/types';

// Minimal 4×4 puzzle: placing red at (0,0) achieves the target in one move.
function makeTestPuzzle(): GeneratedPuzzle {
  const target: Board = [
    ['red', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty'],
  ];
  return { target, solution: [{ color: 'red', row: 0, col: 0 }], gridSize: 4, seed: 'test' };
}

// jsdom does not implement window.matchMedia; provide a default stub.
function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('GameScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    mockMatchMedia(false); // default: no reduced-motion preference
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial render shows board (not pattern), timer 00:00, score 0', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    expect(screen.getByText('Reveal Pattern')).toBeInTheDocument();
    expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00');
    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
    // Board cells are disabled in idle state (not interactive)
    screen.getAllByRole('button', { name: /cell at row/i }).forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  it('first reveal shows "Get ready..." then displays the pattern after 1 second', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByText('Reveal Pattern'));

    // During transition: blank screen visible, pattern not yet shown
    expect(screen.getByTestId('transition-blank')).toBeInTheDocument();
    expect(screen.queryByLabelText('Red cell at row 1, column 1')).toBeNull();

    // After 1 second: pattern is visible
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByTestId('transition-blank')).toBeNull();
    expect(screen.getByText('Hide / Start Solving')).toBeInTheDocument();
    expect(screen.getByLabelText('Red cell at row 1, column 1')).toBeInTheDocument();
    // First reveal is free
    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
  });

  it('Hide / Start Solving shows "Get ready..." then displays the board after 1 second', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByText('Reveal Pattern'));
    act(() => vi.advanceTimersByTime(1000));

    fireEvent.click(screen.getByText('Hide / Start Solving'));

    // During transition: blank screen visible
    expect(screen.getByTestId('transition-blank')).toBeInTheDocument();

    // After 1 second: board is visible
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByTestId('transition-blank')).toBeNull();
    // Board cells visible
    expect(screen.getAllByRole('button', { name: /cell at row/i }).length).toBeGreaterThan(0);
  });

  it('after hide → select color → tap cell, the board updates', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByText('Reveal Pattern'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByText('Hide / Start Solving'));
    act(() => vi.advanceTimersByTime(1000));

    // Now in playing state — select red and tap (row 2, col 2) to avoid completing the puzzle
    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 2, column 2'));

    expect(screen.getByLabelText('Red cell at row 2, column 2')).toBeInTheDocument();
  });

  it('winning placement enters validating phase (Solved! shown) with tap-to-continue affordance', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByText('Reveal Pattern'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByText('Hide / Start Solving'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByLabelText('Select red'));
    // Tap (row 1, col 1) = index (0,0) — matches target
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));

    // Now in validating — Solved! shown, tap-to-continue affordance present
    expect(screen.queryByText('Puzzle Complete! 🎉')).toBeNull();
    expect(screen.getByText('Solved!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue to summary' })).toBeInTheDocument();

    // Advance well past SWEEP_MS (850ms) — no auto-advance
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByText('Puzzle Complete! 🎉')).toBeNull();

    // Player taps to continue → summary appears
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));
    expect(screen.getByText('Puzzle Complete! 🎉')).toBeInTheDocument();
  });

  it('game controls are suppressed during validating phase; tap-to-continue is present', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByText('Reveal Pattern'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByText('Hide / Start Solving'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));

    // In validating: gameplay controls suppressed; tap-to-continue present
    expect(screen.queryByText('Reveal Pattern')).toBeNull();
    expect(screen.queryByText('Hide / Start Solving')).toBeNull();
    expect(screen.queryByText('Restart')).toBeNull();
    expect(screen.queryByText('Quit')).toBeNull();
    expect(screen.queryByLabelText('Select red')).toBeNull();
    expect(screen.getByRole('button', { name: 'Continue to summary' })).toBeInTheDocument();
  });

  it('under prefers-reduced-motion, shows solved board + tap-to-continue with no auto-advance', () => {
    mockMatchMedia(true); // override: reduced-motion active
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByText('Reveal Pattern'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByText('Hide / Start Solving'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));

    // In validating — tap-to-continue present, no auto-advance
    expect(screen.queryByText('Puzzle Complete! 🎉')).toBeNull();
    expect(screen.getByRole('button', { name: 'Continue to summary' })).toBeInTheDocument();

    // Advance well past any former timeout — still no auto-advance
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByText('Puzzle Complete! 🎉')).toBeNull();

    // Player taps to continue → summary appears
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));
    expect(screen.getByText('Puzzle Complete! 🎉')).toBeInTheDocument();
  });

  it('Restart in daily mode resets score to 0 but keeps the timer running', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} mode="daily" onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByText('Reveal Pattern'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByText('Hide / Start Solving'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 2, column 2'));

    expect(Number(screen.getByTestId('score-value').textContent)).toBeGreaterThan(0);
    const timerBefore = screen.getByTestId('timer-value').textContent;

    fireEvent.click(screen.getByText('Restart'));

    // Score resets to 0; timer continues from where it was (not 00:00)
    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
    expect(screen.getByTestId('timer-value').textContent).toBe(timerBefore);
    expect(screen.getByText('Reveal Pattern')).toBeInTheDocument();
  });

  it('Restart in practice mode resets score and timer to zero', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} mode="practice" onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByText('Reveal Pattern'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByText('Hide / Start Solving'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 2, column 2'));

    expect(Number(screen.getByTestId('score-value').textContent)).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Restart'));

    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
    expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00');
    expect(screen.getByText('Reveal Pattern')).toBeInTheDocument();
  });

  it('visibilitychange→hidden in validating phase does NOT write a blob to rygo:inprogress', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} mode="daily" dayKey="2026-05-24" onPickDifficulty={vi.fn()} />);

    // Reach validating phase (solve the puzzle)
    fireEvent.click(screen.getByText('Reveal Pattern'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByText('Hide / Start Solving'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    expect(screen.getByText('Solved!')).toBeInTheDocument(); // validating

    // Simulate backgrounding while in validating
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    fireEvent(document, new Event('visibilitychange'));

    expect(localStorage.getItem(IN_PROGRESS_KEY)).toBeNull();
  });

  it('visibilitychange→hidden in complete phase does NOT resurrect the blob', () => {
    const onDailyComplete = vi.fn();
    render(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="daily"
        dayKey="2026-05-24"
        onPickDifficulty={vi.fn()}
        onDailyComplete={onDailyComplete}
      />
    );

    // Reach complete phase
    fireEvent.click(screen.getByText('Reveal Pattern'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByText('Hide / Start Solving'));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));
    expect(screen.getByText('Puzzle Complete! 🎉')).toBeInTheDocument(); // complete
    expect(onDailyComplete).toHaveBeenCalledOnce();

    // No blob should be present after completion
    expect(localStorage.getItem(IN_PROGRESS_KEY)).toBeNull();

    // Simulate backgrounding while on Summary
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    fireEvent(document, new Event('visibilitychange'));

    // Blob must still be absent — completion delete not undone
    expect(localStorage.getItem(IN_PROGRESS_KEY)).toBeNull();
  });

  it('Quit calls onPickDifficulty immediately without window.confirm', () => {
    const onPickDifficulty = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={onPickDifficulty} />);
    fireEvent.click(screen.getByText('Quit'));

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(onPickDifficulty).toHaveBeenCalledOnce();

    confirmSpy.mockRestore();
  });

  it('Restarting during a transition clears it immediately with no stale update after the timer', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByText('Reveal Pattern'));
    // In transition
    expect(screen.getByTestId('transition-blank')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Restart'));

    // Transition cleared immediately
    expect(screen.queryByTestId('transition-blank')).toBeNull();
    expect(screen.getByTestId('score-value')).toHaveTextContent('0');

    // Advancing past the original timer should produce no stale state
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByTestId('transition-blank')).toBeNull();
  });
});

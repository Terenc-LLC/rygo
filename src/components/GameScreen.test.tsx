import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameScreen, IN_PROGRESS_KEY } from './GameScreen';
import type { GeneratedPuzzle } from '../engine/generator';
import type { Board } from '../engine/types';

const { mockEnqueueAndSubmit, mockGetStanding } = vi.hoisted(() => ({
  mockEnqueueAndSubmit: vi.fn().mockResolvedValue(undefined),
  mockGetStanding: vi.fn().mockResolvedValue(null),
}));

vi.mock('../persistence/submitScore', () => ({
  enqueueAndSubmit: mockEnqueueAndSubmit,
  PENDING_SUBMIT_KEY: 'rygo:pending-submit',
}));

vi.mock('../backend/getStanding', () => ({
  getStanding: mockGetStanding,
}));

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
    mockMatchMedia(false);
    localStorage.clear();
    mockEnqueueAndSubmit.mockClear();
    mockGetStanding.mockClear();
    mockGetStanding.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial render shows reference thumbnail, play grid, color picker, score 0', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    expect(screen.getByTestId('ref-thumbnail')).toBeInTheDocument();
    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
    expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00');
    // Color picker is always visible
    expect(screen.getByLabelText('Select red')).toBeInTheDocument();
    // No reveal toggle
    expect(screen.queryByText('Reveal Pattern')).toBeNull();
    expect(screen.queryByTestId('transition-blank')).toBeNull();
  });

  it('play grid cells are interactive immediately (no reveal step required)', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);
    // Grid cells are not disabled — onCellTap is always wired in playing phase
    screen.getAllByRole('button', { name: /cell at row/i }).forEach(btn => {
      expect(btn).not.toBeDisabled();
    });
  });

  it('selecting a color and tapping a cell updates the board', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 2, column 2'));

    expect(screen.getByLabelText('Red cell at row 2, column 2')).toBeInTheDocument();
  });

  it('winning placement enters validating phase (Solved! shown) with tap-to-continue', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));

    // Now in validating
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

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));

    // In validating: gameplay controls suppressed
    expect(screen.queryByText('Reveal Pattern')).toBeNull();
    expect(screen.queryByText('Restart')).toBeNull();
    expect(screen.queryByText('Quit')).toBeNull();
    expect(screen.queryByLabelText('Select red')).toBeNull();
    expect(screen.getByRole('button', { name: 'Continue to summary' })).toBeInTheDocument();
  });

  it('under prefers-reduced-motion, shows solved board + tap-to-continue with no auto-advance', () => {
    mockMatchMedia(true);
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));

    expect(screen.queryByText('Puzzle Complete! 🎉')).toBeNull();
    expect(screen.getByRole('button', { name: 'Continue to summary' })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByText('Puzzle Complete! 🎉')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));
    expect(screen.getByText('Puzzle Complete! 🎉')).toBeInTheDocument();
  });

  it('Restart in daily mode resets score to 0 but keeps the timer running', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} mode="daily" onPickDifficulty={vi.fn()} />);

    act(() => {}); // flush RESUME_TIMER
    act(() => vi.advanceTimersByTime(500));

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 2, column 2'));

    expect(Number(screen.getByTestId('score-value').textContent)).toBeGreaterThan(0);
    const timerBefore = screen.getByTestId('timer-value').textContent;

    fireEvent.click(screen.getByText('Restart'));

    // Score resets to 0; timer continues from where it was (not 00:00)
    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
    expect(screen.getByTestId('timer-value').textContent).toBe(timerBefore);
    // Color picker and grid are still visible
    expect(screen.getByLabelText('Select red')).toBeInTheDocument();
  });

  it('Restart in practice mode resets score and timer to zero', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} mode="practice" onPickDifficulty={vi.fn()} />);

    act(() => {}); // flush RESUME_TIMER
    act(() => vi.advanceTimersByTime(500));

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 2, column 2'));

    expect(Number(screen.getByTestId('score-value').textContent)).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Restart'));

    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
    expect(screen.getByTestId('timer-value')).toHaveTextContent('00:00');
    expect(screen.getByLabelText('Select red')).toBeInTheDocument();
  });

  it('visibilitychange→hidden in validating phase does NOT write a blob to rygo:inprogress', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} mode="daily" dayKey="2026-05-24" onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    expect(screen.getByText('Solved!')).toBeInTheDocument(); // validating

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

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));
    expect(screen.getByText('Puzzle Complete! 🎉')).toBeInTheDocument();
    expect(onDailyComplete).toHaveBeenCalledOnce();

    expect(localStorage.getItem(IN_PROGRESS_KEY)).toBeNull();

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    fireEvent(document, new Event('visibilitychange'));

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

  it('daily complete fires enqueueAndSubmit exactly once', async () => {
    render(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="daily"
        dayKey="2026-05-25"
        onPickDifficulty={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1')); // validating
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' })); // complete

    await act(async () => { await Promise.resolve(); });

    expect(mockEnqueueAndSubmit).toHaveBeenCalledOnce();
    expect(mockEnqueueAndSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ day: '2026-05-25', grid_size: 4 }),
    );
  });

  it('daily complete does not fire enqueueAndSubmit a second time on re-render', async () => {
    const { rerender } = render(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="daily"
        dayKey="2026-05-25"
        onPickDifficulty={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));
    await act(async () => { await Promise.resolve(); });

    expect(mockEnqueueAndSubmit).toHaveBeenCalledOnce();

    rerender(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="daily"
        dayKey="2026-05-25"
        onPickDifficulty={vi.fn()}
      />
    );
    await act(async () => { await Promise.resolve(); });

    expect(mockEnqueueAndSubmit).toHaveBeenCalledOnce();
  });

  it('practice mode complete does NOT call enqueueAndSubmit', async () => {
    render(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="practice"
        onPickDifficulty={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));
    await act(async () => { await Promise.resolve(); });

    expect(mockEnqueueAndSubmit).not.toHaveBeenCalled();
  });

  it('daily complete calls getStanding exactly once with correct args', async () => {
    mockGetStanding.mockResolvedValue({ rank: 2, total: 10 });
    render(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="daily"
        dayKey="2026-05-26"
        onPickDifficulty={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));

    await act(async () => { await Promise.resolve(); });

    expect(mockGetStanding).toHaveBeenCalledOnce();
    expect(mockGetStanding).toHaveBeenCalledWith('2026-05-26', 4, expect.any(Number), expect.any(Number));
  });

  it('standing line appears in Summary when getStanding resolves with a value', async () => {
    mockGetStanding.mockResolvedValue({ rank: 3, total: 20 });
    render(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="daily"
        dayKey="2026-05-26"
        onPickDifficulty={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));

    await act(async () => { await Promise.resolve(); });

    expect(screen.getByTestId('standing-line')).toHaveTextContent('#3 of 20 today');
  });

  it('standing line is absent when getStanding resolves null', async () => {
    mockGetStanding.mockResolvedValue(null);
    render(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="daily"
        dayKey="2026-05-26"
        onPickDifficulty={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));

    await act(async () => { await Promise.resolve(); });

    expect(screen.queryByTestId('standing-line')).toBeNull();
  });

  it('getStanding fires exactly once — not on re-render', async () => {
    mockGetStanding.mockResolvedValue({ rank: 1, total: 5 });
    const { rerender } = render(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="daily"
        dayKey="2026-05-26"
        onPickDifficulty={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));
    await act(async () => { await Promise.resolve(); });

    expect(mockGetStanding).toHaveBeenCalledOnce();

    rerender(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="daily"
        dayKey="2026-05-26"
        onPickDifficulty={vi.fn()}
      />
    );
    await act(async () => { await Promise.resolve(); });

    expect(mockGetStanding).toHaveBeenCalledOnce();
  });

  it('practice mode complete does NOT call getStanding', async () => {
    render(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="practice"
        onPickDifficulty={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));
    await act(async () => { await Promise.resolve(); });

    expect(mockGetStanding).not.toHaveBeenCalled();
  });

  it('clamped denominator: rank > total renders max(rank, total) correctly', async () => {
    mockGetStanding.mockResolvedValue({ rank: 5, total: 3 });
    render(
      <GameScreen
        puzzle={makeTestPuzzle()}
        mode="daily"
        dayKey="2026-05-26"
        onPickDifficulty={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 1, column 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to summary' }));

    await act(async () => { await Promise.resolve(); });

    expect(screen.getByTestId('standing-line')).toHaveTextContent('#5 of 5 today');
  });

  it('par slot is present in the header cluster', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);
    expect(screen.getByTestId('par-slot')).toBeInTheDocument();
  });

  it('opening and closing the ref thumbnail overlay does not change moveCount', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} onPickDifficulty={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Select red'));
    fireEvent.click(screen.getByLabelText('Empty cell at row 2, column 2'));

    const scoreBefore = screen.getByTestId('score-value').textContent;
    expect(Number(scoreBefore)).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    expect(screen.getByTestId('score-value').textContent).toBe(scoreBefore);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByTestId('score-value').textContent).toBe(scoreBefore);
  });

  it('opening and closing the ref thumbnail overlay does not affect the timer', () => {
    render(<GameScreen puzzle={makeTestPuzzle()} mode="practice" onPickDifficulty={vi.fn()} />);

    act(() => {}); // flush RESUME_TIMER
    act(() => vi.advanceTimersByTime(1000));

    const timerBefore = screen.getByTestId('timer-value').textContent;
    expect(timerBefore).not.toBe('00:00');

    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    expect(screen.getByTestId('timer-value').textContent).toBe(timerBefore);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByTestId('timer-value').textContent).toBe(timerBefore);
  });
});

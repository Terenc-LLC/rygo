import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LevelButton } from './LevelButton';

describe('LevelButton', () => {
  it('renders with completedToday undefined (default state) without errors', () => {
    expect(() =>
      render(<LevelButton size={4} label="Easy" onSelect={vi.fn()} />)
    ).not.toThrow();
  });

  it('renders the label and grid size for Normal (5×5)', () => {
    render(<LevelButton size={5} label="Normal" onSelect={vi.fn()} />);
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('5×5 grid')).toBeInTheDocument();
  });

  it('renders the label and grid size for Hard (6×6)', () => {
    render(<LevelButton size={6} label="Hard" onSelect={vi.fn()} />);
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('6×6 grid')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<LevelButton size={8} label="Extreme" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  describe('completed state', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // 2026-05-24 12:00:00 UTC → 12 hours until midnight
      vi.setSystemTime(new Date('2026-05-24T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows recorded moves and time when completedToday is provided', () => {
      render(
        <LevelButton
          size={4}
          label="Easy"
          onSelect={vi.fn()}
          completedToday={{ moves: 11, elapsedMs: 84200 }}
        />
      );
      // 84200ms = 1 minute 24 seconds
      expect(screen.getByTestId('result-4')).toHaveTextContent('11 moves · 01:24');
    });

    it('shows a live countdown to the next UTC day', () => {
      render(
        <LevelButton
          size={4}
          label="Easy"
          onSelect={vi.fn()}
          completedToday={{ moves: 11, elapsedMs: 84200 }}
        />
      );
      // At 12:00 UTC, 12 hours remain → "12:00:00"
      expect(screen.getByTestId('countdown-4')).toHaveTextContent('Next puzzle in 12:00:00');
    });

    it('countdown decrements each second', () => {
      render(
        <LevelButton
          size={4}
          label="Easy"
          onSelect={vi.fn()}
          completedToday={{ moves: 11, elapsedMs: 84200 }}
        />
      );
      expect(screen.getByTestId('countdown-4')).toHaveTextContent('12:00:00');
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByTestId('countdown-4')).toHaveTextContent('11:59:59');
    });

    it('shows "Practice" label instead of the arrow chevron', () => {
      render(
        <LevelButton
          size={5}
          label="Normal"
          onSelect={vi.fn()}
          completedToday={{ moves: 8, elapsedMs: 60000 }}
        />
      );
      expect(screen.getByText('Practice')).toBeInTheDocument();
    });

    it('tapping the completed button still calls onSelect', () => {
      const onSelect = vi.fn();
      render(
        <LevelButton
          size={4}
          label="Easy"
          onSelect={onSelect}
          completedToday={{ moves: 11, elapsedMs: 84200 }}
        />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onSelect).toHaveBeenCalledOnce();
    });

    it('still shows label and grid size when completed', () => {
      render(
        <LevelButton
          size={6}
          label="Hard"
          onSelect={vi.fn()}
          completedToday={{ moves: 15, elapsedMs: 120000 }}
        />
      );
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('6×6 grid')).toBeInTheDocument();
    });

    it('no countdown shown when completedToday is undefined', () => {
      render(<LevelButton size={4} label="Easy" onSelect={vi.fn()} />);
      expect(screen.queryByTestId('countdown-4')).toBeNull();
    });
  });
});

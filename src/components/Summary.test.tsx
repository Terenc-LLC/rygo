import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Summary } from './Summary';

const defaultProps = {
  gridSize: 5 as const,
  moveCount: 14,
  elapsedMs: 161000,
  date: '2026-05-24',
  mode: 'daily' as const,
  streak: 5,
  onPlayAgain: vi.fn(),
  onPickDifficulty: vi.fn(),
};

// Standing prop helpers
const withStanding = (standing: { rank: number; total: number } | null | undefined) => ({
  ...defaultProps,
  standing,
});

describe('Summary', () => {
  it('renders Share button', () => {
    render(<Summary {...defaultProps} />);
    expect(screen.getByTestId('share-button')).toBeInTheDocument();
  });

  describe('standing line', () => {
    it('renders "#R of N today" when standing is provided with rank < total', () => {
      render(<Summary {...withStanding({ rank: 3, total: 20 })} />);
      expect(screen.getByTestId('standing-line')).toHaveTextContent('#3 of 20 today');
    });

    it('clamps denominator to rank when rank > total (own row not yet counted)', () => {
      render(<Summary {...withStanding({ rank: 5, total: 3 })} />);
      expect(screen.getByTestId('standing-line')).toHaveTextContent('#5 of 5 today');
    });

    it('renders correctly when rank === total', () => {
      render(<Summary {...withStanding({ rank: 7, total: 7 })} />);
      expect(screen.getByTestId('standing-line')).toHaveTextContent('#7 of 7 today');
    });

    it('renders rank 1 of 1 (first submission in the day)', () => {
      render(<Summary {...withStanding({ rank: 1, total: 1 })} />);
      expect(screen.getByTestId('standing-line')).toHaveTextContent('#1 of 1 today');
    });

    it('omits the line when standing is null', () => {
      render(<Summary {...withStanding(null)} />);
      expect(screen.queryByTestId('standing-line')).toBeNull();
    });

    it('omits the line when standing prop is not provided', () => {
      render(<Summary {...defaultProps} />);
      expect(screen.queryByTestId('standing-line')).toBeNull();
    });

    it('omits the line when standing is undefined', () => {
      render(<Summary {...withStanding(undefined)} />);
      expect(screen.queryByTestId('standing-line')).toBeNull();
    });

    it('does not show a spinner or reserved slot when omitted', () => {
      render(<Summary {...defaultProps} />);
      // No placeholder, no loading text — the rest of Summary renders fully
      expect(screen.getByTestId('share-button')).toBeInTheDocument();
      expect(screen.queryByTestId('standing-line')).toBeNull();
    });
  });

  describe('clipboard fallback (navigator.share undefined)', () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      mockWriteText.mockClear();
      // jsdom does not implement navigator.share — it is already undefined.
      // Install a clipboard mock so the fallback path exercises writeText.
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
        writable: true,
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('calls clipboard.writeText with the expected share text', async () => {
      render(<Summary {...defaultProps} />);
      await act(async () => {
        fireEvent.click(screen.getByTestId('share-button'));
      });
      expect(mockWriteText).toHaveBeenCalledTimes(1);
      const text = mockWriteText.mock.calls[0][0] as string;
      expect(text).toContain('RYGO · 2026-05-24 · Normal (5×5)');
      expect(text).toContain('14 moves');
      expect(text).toContain('🔥 5-day streak');
      expect(text).toContain('playRYGO.com');
    });

    it('shows Copied! immediately after clipboard write', async () => {
      vi.useFakeTimers();
      try {
        render(<Summary {...defaultProps} />);
        await act(async () => {
          fireEvent.click(screen.getByTestId('share-button'));
        });
        expect(screen.getByTestId('share-button')).toHaveTextContent('Copied!');
      } finally {
        vi.useRealTimers();
      }
    });

    it('reverts Share button label after 2 seconds', async () => {
      vi.useFakeTimers();
      try {
        render(<Summary {...defaultProps} />);
        await act(async () => {
          fireEvent.click(screen.getByTestId('share-button'));
        });
        act(() => {
          vi.advanceTimersByTime(2001);
        });
        expect(screen.getByTestId('share-button')).toHaveTextContent('Share');
      } finally {
        vi.useRealTimers();
      }
    });
  });
});

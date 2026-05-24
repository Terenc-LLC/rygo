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

describe('Summary', () => {
  it('renders Share button', () => {
    render(<Summary {...defaultProps} />);
    expect(screen.getByTestId('share-button')).toBeInTheDocument();
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

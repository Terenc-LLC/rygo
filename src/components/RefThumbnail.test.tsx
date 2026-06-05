import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RefThumbnail } from './RefThumbnail';
import type { Board } from '../engine/types';

const TEST_BOARD: Board = [
  ['red', 'empty', 'empty', 'empty'],
  ['empty', 'yellow', 'empty', 'empty'],
  ['empty', 'empty', 'green', 'empty'],
  ['empty', 'empty', 'empty', 'red'],
];

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

describe('RefThumbnail — button and overlay', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it('renders as a button with aria-label "Enlarge target pattern" and data-testid', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    const btn = screen.getByRole('button', { name: 'Enlarge target pattern' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('data-testid', 'ref-thumbnail');
  });

  it('thumbnail button has bg-paper and dark:bg-ink for Paper-gap treatment', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    const btn = screen.getByTestId('ref-thumbnail');
    expect(btn.className).toContain('bg-paper');
    expect(btn.className).toContain('dark:bg-ink');
  });

  it('overlay board has bg-paper and dark:bg-ink for Paper-gap treatment', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    const overlayBoard = screen.getByTestId('ref-overlay-board');
    expect(overlayBoard.className).toContain('bg-paper');
    expect(overlayBoard.className).toContain('dark:bg-ink');
  });

  it('overlay is not present on initial render', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    expect(screen.queryByTestId('ref-overlay')).toBeNull();
  });

  it('tapping the thumbnail opens the overlay', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    expect(screen.getByTestId('ref-overlay')).toBeInTheDocument();
  });

  it('overlay has role="dialog" and aria-modal', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('overlay renders the target board (ref-overlay-board testid present)', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    expect(screen.getByTestId('ref-overlay-board')).toBeInTheDocument();
    expect(screen.getByText('Target Pattern')).toBeInTheDocument();
  });

  it('close button dismisses the overlay', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    expect(screen.getByTestId('ref-overlay')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('ref-overlay')).toBeNull();
  });

  it('tapping outside the content (on the overlay container) dismisses the overlay', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    expect(screen.getByTestId('ref-overlay')).toBeInTheDocument();
    // Click the outer overlay container (backdrop area)
    fireEvent.click(screen.getByTestId('ref-overlay'));
    expect(screen.queryByTestId('ref-overlay')).toBeNull();
  });

  it('Escape key dismisses the overlay', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    expect(screen.getByTestId('ref-overlay')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('ref-overlay')).toBeNull();
  });

  it('overlay can be reopened after being closed', () => {
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    const trigger = screen.getByRole('button', { name: 'Enlarge target pattern' });

    fireEvent.click(trigger);
    expect(screen.getByTestId('ref-overlay')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('ref-overlay')).toBeNull();

    fireEvent.click(trigger);
    expect(screen.getByTestId('ref-overlay')).toBeInTheDocument();
  });

  it('works correctly under prefers-reduced-motion', () => {
    mockMatchMedia(true); // reduced motion on
    render(<RefThumbnail board={TEST_BOARD} size={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    expect(screen.getByTestId('ref-overlay')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('ref-overlay')).toBeNull();
  });

  it('works for 8×8 grid size', () => {
    const board8: Board = Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 8 }, (_, c): Board[0][0] => (r === c ? 'red' : 'empty'))
    );
    render(<RefThumbnail board={board8} size={8} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge target pattern' }));
    expect(screen.getByTestId('ref-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('ref-overlay-board')).toBeInTheDocument();
  });
});

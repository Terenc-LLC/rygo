import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Grid } from './Grid';
import type { Board, CellState } from '../engine/types';

function makeBoard(size: number, fill: CellState = 'empty'): Board {
  return Array.from({ length: size }, () => Array(size).fill(fill) as CellState[]);
}

// ---------------------------------------------------------------------------
// Cell count
// ---------------------------------------------------------------------------

describe('cell count', () => {
  it('renders 16 buttons for a 4×4 grid', () => {
    render(<Grid board={makeBoard(4)} size={4} />);
    expect(screen.getAllByRole('button')).toHaveLength(16);
  });

  it('renders 25 buttons for a 5×5 grid', () => {
    render(<Grid board={makeBoard(5)} size={5} />);
    expect(screen.getAllByRole('button')).toHaveLength(25);
  });

  it('renders 36 buttons for a 6×6 grid', () => {
    render(<Grid board={makeBoard(6)} size={6} />);
    expect(screen.getAllByRole('button')).toHaveLength(36);
  });

  it('renders 64 buttons for an 8×8 grid', () => {
    render(<Grid board={makeBoard(8)} size={8} />);
    expect(screen.getAllByRole('button')).toHaveLength(64);
  });
});

// ---------------------------------------------------------------------------
// Grid container — grid-line treatment
// ---------------------------------------------------------------------------

describe('grid container', () => {
  it('has bg-grid-line and dark:bg-ink for grid-line treatment', () => {
    const { container } = render(<Grid board={makeBoard(4)} size={4} />);
    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv.className).toContain('bg-grid-line');
    expect(gridDiv.className).toContain('dark:bg-ink');
  });

  it('has p-px outer padding so the grid-line background frames the board', () => {
    const { container } = render(<Grid board={makeBoard(4)} size={4} />);
    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv.className).toContain('p-px');
  });
});

// ---------------------------------------------------------------------------
// Background color classes
// ---------------------------------------------------------------------------

describe('cell background classes', () => {
  it('empty cells have bg-stone-300 and dark:bg-gray-800', () => {
    render(<Grid board={makeBoard(4, 'empty')} size={4} />);
    screen.getAllByRole('button').forEach(btn => {
      expect(btn.className).toContain('bg-stone-300');
      expect(btn.className).toContain('dark:bg-gray-800');
    });
  });

  it('red cells have bg-rygo-red and no dark variant', () => {
    const board = makeBoard(4, 'red');
    render(<Grid board={board} size={4} />);
    screen.getAllByRole('button').forEach(btn => {
      expect(btn.className).toContain('bg-rygo-red');
      expect(btn.className).not.toContain('dark:bg-rygo-red');
    });
  });

  it('yellow cells have bg-rygo-yellow and no dark variant', () => {
    const board = makeBoard(4, 'yellow');
    render(<Grid board={board} size={4} />);
    screen.getAllByRole('button').forEach(btn => {
      expect(btn.className).toContain('bg-rygo-yellow');
      expect(btn.className).not.toContain('dark:bg-rygo-yellow');
    });
  });

  it('green cells have bg-rygo-green and no dark variant', () => {
    const board = makeBoard(4, 'green');
    render(<Grid board={board} size={4} />);
    screen.getAllByRole('button').forEach(btn => {
      expect(btn.className).toContain('bg-rygo-green');
      expect(btn.className).not.toContain('dark:bg-rygo-green');
    });
  });
});

// ---------------------------------------------------------------------------
// Shape SVG rendering
// ---------------------------------------------------------------------------

describe('shape rendering', () => {
  it('red cells render a Square', () => {
    const board = makeBoard(4, 'red');
    render(<Grid board={board} size={4} />);
    screen.getAllByRole('button').forEach(btn => {
      expect(btn.querySelector('[data-testid="shape-square"]')).not.toBeNull();
    });
  });

  it('yellow cells render a Triangle', () => {
    const board = makeBoard(4, 'yellow');
    render(<Grid board={board} size={4} />);
    screen.getAllByRole('button').forEach(btn => {
      expect(btn.querySelector('[data-testid="shape-triangle"]')).not.toBeNull();
    });
  });

  it('green cells render a Circle', () => {
    const board = makeBoard(4, 'green');
    render(<Grid board={board} size={4} />);
    screen.getAllByRole('button').forEach(btn => {
      expect(btn.querySelector('[data-testid="shape-circle"]')).not.toBeNull();
    });
  });

  it('empty cells render no shape', () => {
    render(<Grid board={makeBoard(4, 'empty')} size={4} />);
    screen.getAllByRole('button').forEach(btn => {
      expect(btn.querySelector('svg')).toBeNull();
    });
  });

  it('each state renders the correct and only its shape', () => {
    const board: Board = [
      ['empty', 'red', 'yellow', 'green'],
      ['empty', 'red', 'yellow', 'green'],
      ['empty', 'red', 'yellow', 'green'],
      ['empty', 'red', 'yellow', 'green'],
    ];
    render(<Grid board={board} size={4} />);
    const btns = screen.getAllByRole('button');
    // Cells in column order: empty, red, yellow, green repeating
    for (let row = 0; row < 4; row++) {
      const base = row * 4;
      expect(btns[base + 0].querySelector('svg')).toBeNull(); // empty
      expect(btns[base + 1].querySelector('[data-testid="shape-square"]')).not.toBeNull(); // red
      expect(btns[base + 2].querySelector('[data-testid="shape-triangle"]')).not.toBeNull(); // yellow
      expect(btns[base + 3].querySelector('[data-testid="shape-circle"]')).not.toBeNull(); // green
    }
  });
});

// ---------------------------------------------------------------------------
// onCellTap callback
// ---------------------------------------------------------------------------

describe('onCellTap', () => {
  it('calls onCellTap with correct row and col on click', () => {
    const board = makeBoard(4, 'empty');
    const handler = vi.fn();
    render(<Grid board={board} size={4} onCellTap={handler} />);
    const btns = screen.getAllByRole('button');

    fireEvent.click(btns[0]); // row 0, col 0
    expect(handler).toHaveBeenCalledWith(0, 0);

    fireEvent.click(btns[5]); // row 1, col 1 (4-wide grid)
    expect(handler).toHaveBeenCalledWith(1, 1);

    fireEvent.click(btns[15]); // row 3, col 3
    expect(handler).toHaveBeenCalledWith(3, 3);
  });

  it('renders without errors when onCellTap is not provided', () => {
    expect(() => render(<Grid board={makeBoard(4)} size={4} />)).not.toThrow();
  });

  it('cells are disabled when onCellTap is not provided', () => {
    render(<Grid board={makeBoard(4)} size={4} />);
    screen.getAllByRole('button').forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  it('cells are enabled when onCellTap is provided', () => {
    render(<Grid board={makeBoard(4)} size={4} onCellTap={vi.fn()} />);
    screen.getAllByRole('button').forEach(btn => {
      expect(btn).not.toBeDisabled();
    });
  });
});

// ---------------------------------------------------------------------------
// aria-label
// ---------------------------------------------------------------------------

describe('aria-label', () => {
  it('labels each cell with 1-indexed row/col and state', () => {
    const board: Board = [
      ['empty', 'red'],
      ['yellow', 'green'],
      ['empty', 'red'],
      ['yellow', 'green'],
    ];
    render(<Grid board={board} size={4} />);
    expect(screen.getByLabelText('Empty cell at row 1, column 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Red cell at row 1, column 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Yellow cell at row 2, column 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Green cell at row 2, column 2')).toBeInTheDocument();
  });

  it('produces correct label for a corner cell of an 8×8 grid', () => {
    const board = makeBoard(8, 'empty');
    board[7][7] = 'red';
    render(<Grid board={board} size={8} />);
    expect(screen.getByLabelText('Red cell at row 8, column 8')).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('starts on the difficulty picker', () => {
    render(<App />);
    expect(screen.getAllByAltText('RYGO')[0]).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Extreme')).toBeInTheDocument();
  });

  it('selecting a difficulty mounts the game screen', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Easy'));
    // No reveal toggle in TER-221 logic-loop; reference thumbnail always visible
    expect(screen.getByTestId('ref-thumbnail')).toBeInTheDocument();
    expect(screen.getByTestId('score-value')).toBeInTheDocument();
    expect(screen.getByTestId('timer-value')).toBeInTheDocument();
  });

  it('selecting Normal starts a 5×5 game (25 play grid cells, always visible)', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal'));
    // Cells are in the play grid immediately — no reveal step needed
    const cells = screen.getAllByRole('button', { name: /cell at row/i });
    expect(cells).toHaveLength(25);
  });

  it('global theme toggle overlay is present on the difficulty screen', () => {
    render(<App />);
    expect(screen.getByTestId('global-theme-toggle')).toBeInTheDocument();
  });

  it('global theme toggle overlay is suppressed on the game screen; toggle is in the game header instead', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Easy'));
    expect(screen.queryByTestId('global-theme-toggle')).toBeNull();
    // Toggle is still accessible — GameScreen renders it in the header cluster
    expect(screen.getByLabelText(/switch to .* theme/i)).toBeInTheDocument();
    // Reference thumbnail and toggle coexist in the game header
    expect(screen.getByTestId('ref-thumbnail')).toBeInTheDocument();
  });

  it('global theme toggle returns when navigating back from game to difficulty', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Easy'));
    expect(screen.queryByTestId('global-theme-toggle')).toBeNull();

    fireEvent.click(screen.getByText('Quit'));
    expect(screen.getByTestId('global-theme-toggle')).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RulesScreen } from './RulesScreen';
import App from '../App';

const TODAY_MS = new Date('2026-05-24T12:00:00Z').getTime();

describe('RulesScreen', () => {
  it('renders all key content sections', () => {
    render(<RulesScreen onBack={() => {}} />);
    expect(screen.getByTestId('rules-screen')).toBeInTheDocument();
    expect(screen.getByTestId('rules-goal')).toBeInTheDocument();
    expect(screen.getByTestId('rules-colors')).toBeInTheDocument();
    expect(screen.getByTestId('rules-blocking')).toBeInTheDocument();
    expect(screen.getByTestId('rules-overwrite')).toBeInTheDocument();
    expect(screen.getByTestId('rules-clearing')).toBeInTheDocument();
    expect(screen.getByTestId('rules-scoring')).toBeInTheDocument();
  });

  it('renders the blocking-example diagram with before and after boards', () => {
    render(<RulesScreen onBack={() => {}} />);
    expect(screen.getByTestId('blocking-diagram')).toBeInTheDocument();
    expect(screen.getByTestId('blocking-diagram-before')).toBeInTheDocument();
    expect(screen.getByTestId('blocking-diagram-after')).toBeInTheDocument();
  });

  it('diagram cells carry aria-labels like the live grid', () => {
    render(<RulesScreen onBack={() => {}} />);
    // Red cell should be present in the before board
    expect(screen.getAllByRole('img', { name: /Red cell at row/i })[0]).toBeInTheDocument();
    // Green cells should be present in the after board
    expect(screen.getAllByRole('img', { name: /Green cell at row/i })[0]).toBeInTheDocument();
  });

  it('renders the overwrite table', () => {
    render(<RulesScreen onBack={() => {}} />);
    expect(screen.getByTestId('overwrite-table')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('calls onBack when the Back button is clicked', () => {
    const onBack = vi.fn();
    render(<RulesScreen onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /back to difficulty picker/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

describe('Rules routing (App integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(TODAY_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('"How to play" button on DifficultyPicker navigates to rules screen', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /how to play/i }));
    expect(screen.getByRole('heading', { name: /how to play/i })).toBeInTheDocument();
    expect(screen.getByTestId('rules-screen')).toBeInTheDocument();
  });

  it('Back button on RulesScreen returns to difficulty picker', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /how to play/i }));
    fireEvent.click(screen.getByRole('button', { name: /back to difficulty picker/i }));
    expect(screen.getAllByAltText('RYGO')[0]).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });
});

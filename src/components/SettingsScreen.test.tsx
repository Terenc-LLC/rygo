import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SettingsScreen } from './SettingsScreen';
import App from '../App';

const TODAY_MS = new Date('2026-06-02T12:00:00Z').getTime();

describe('SettingsScreen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the settings screen', () => {
    render(<SettingsScreen onBack={() => {}} />);
    expect(screen.getByTestId('settings-screen')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
  });

  it('always renders the Sound toggle', () => {
    render(<SettingsScreen onBack={() => {}} />);
    expect(screen.getByRole('switch', { name: /^sound$/i })).toBeInTheDocument();
  });

  it('Sound toggle defaults to checked (on)', () => {
    render(<SettingsScreen onBack={() => {}} />);
    expect(screen.getByRole('switch', { name: /^sound$/i })).toBeChecked();
  });

  it('Sound toggle persists when toggled off', () => {
    render(<SettingsScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('switch', { name: /^sound$/i }));
    expect(screen.getByRole('switch', { name: /^sound$/i })).not.toBeChecked();
    const stored = JSON.parse(localStorage.getItem('rygo:settings')!);
    expect(stored.audio).toBe(false);
  });

  it('calls onBack when the Back button is clicked', () => {
    const onBack = vi.fn();
    render(<SettingsScreen onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /back to difficulty picker/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders the privacy disclosure text', () => {
    render(<SettingsScreen onBack={() => {}} />);
    expect(
      screen.getByText(
        /No account, no personal data\. Your device gets a random ID to record daily leaderboard/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /privacy/i })).toBeInTheDocument();
  });

  it('Haptics toggle is hidden when navigator.vibrate is absent', () => {
    // jsdom does not implement navigator.vibrate by default
    render(<SettingsScreen onBack={() => {}} />);
    expect(screen.queryByRole('switch', { name: /^haptics$/i })).toBeNull();
  });

  it('Haptics toggle is shown when navigator.vibrate is present', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      configurable: true,
    });
    render(<SettingsScreen onBack={() => {}} />);
    expect(screen.getByRole('switch', { name: /^haptics$/i })).toBeInTheDocument();
    // delete removes the property so 'vibrate' in navigator is false again
    delete (navigator as unknown as Record<string, unknown>).vibrate;
  });
});

describe('Settings routing (App integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(TODAY_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('"Settings" button on DifficultyPicker navigates to settings screen', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^settings$/i }));
    expect(screen.getByTestId('settings-screen')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
  });

  it('Back button on SettingsScreen returns to difficulty picker', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^settings$/i }));
    fireEvent.click(screen.getByRole('button', { name: /back to difficulty picker/i }));
    expect(screen.getAllByAltText('RYGO')[0]).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });
});

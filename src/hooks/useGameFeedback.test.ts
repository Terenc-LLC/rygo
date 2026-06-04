import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameFeedback } from './useGameFeedback';
import type { GamePhase } from './useGame';

const { mockResume, mockPlayTap, mockPlayWinChime, mockPlayUnderPar } = vi.hoisted(() => ({
  mockResume: vi.fn(),
  mockPlayTap: vi.fn(),
  mockPlayWinChime: vi.fn(),
  mockPlayUnderPar: vi.fn(),
}));

vi.mock('../audio/sounds', () => ({
  resume: mockResume,
  playTap: mockPlayTap,
  playWinChime: mockPlayWinChime,
  playUnderPar: mockPlayUnderPar,
}));

const { mockUseSettings } = vi.hoisted(() => ({
  mockUseSettings: vi.fn().mockReturnValue({ audio: true, haptics: true }),
}));

vi.mock('./useSettings', () => ({
  useSettings: () => mockUseSettings(),
}));

interface Props {
  moveCount: number;
  phase: GamePhase;
  underPar: boolean;
}

function renderFeedback(initial: Props) {
  return renderHook((props: Props) => useGameFeedback(props), { initialProps: initial });
}

describe('useGameFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSettings.mockReturnValue({ audio: true, haptics: true });
  });

  afterEach(() => {
    // Remove any navigator.vibrate added in tests.
    if ('vibrate' in navigator) {
      delete (navigator as unknown as Record<string, unknown>).vibrate;
    }
  });

  describe('tap feedback', () => {
    it('plays tap when moveCount increases in playing phase', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'playing', underPar: false });
      expect(mockPlayTap).toHaveBeenCalledOnce();
    });

    it('does not play tap when moveCount is flat (no-op)', () => {
      const { rerender } = renderFeedback({ moveCount: 1, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'playing', underPar: false });
      expect(mockPlayTap).not.toHaveBeenCalled();
    });

    it('does not play tap on the completing move (phase is already validating)', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      // Completing move: moveCount increases and phase transitions to validating in the same render.
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      expect(mockPlayTap).not.toHaveBeenCalled();
    });

    it('does not play tap when phase is validating (no increase check)', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      // Win transition
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      // No tap even though moveCount went up
      expect(mockPlayTap).not.toHaveBeenCalled();
    });

    it('suppresses tap when audio is off', () => {
      mockUseSettings.mockReturnValue({ audio: false, haptics: true });
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'playing', underPar: false });
      expect(mockPlayTap).not.toHaveBeenCalled();
    });

    it('plays multiple taps for multiple moves', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'playing', underPar: false });
      rerender({ moveCount: 2, phase: 'playing', underPar: false });
      rerender({ moveCount: 3, phase: 'playing', underPar: false });
      expect(mockPlayTap).toHaveBeenCalledTimes(3);
    });
  });

  describe('tap vibration', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'vibrate', {
        value: vi.fn(),
        configurable: true,
      });
    });

    it('vibrates on tap when haptics is on and navigator.vibrate is present', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'playing', underPar: false });
      expect(navigator.vibrate).toHaveBeenCalledWith(15);
    });

    it('does not vibrate when haptics is off', () => {
      mockUseSettings.mockReturnValue({ audio: true, haptics: false });
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'playing', underPar: false });
      expect(navigator.vibrate).not.toHaveBeenCalled();
    });
  });

  it('does not vibrate on tap when navigator.vibrate is absent', () => {
    // navigator.vibrate not defined in jsdom by default
    expect('vibrate' in navigator).toBe(false);
    const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
    rerender({ moveCount: 1, phase: 'playing', underPar: false });
    // No throw, and tap still fires
    expect(mockPlayTap).toHaveBeenCalledOnce();
  });

  describe('win feedback', () => {
    it('plays win chime on the validating transition', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      expect(mockPlayWinChime).toHaveBeenCalledOnce();
    });

    it('plays win chime exactly once — not on subsequent re-renders in validating', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      expect(mockPlayWinChime).toHaveBeenCalledOnce();
    });

    it('suppresses win chime when audio is off', () => {
      mockUseSettings.mockReturnValue({ audio: false, haptics: true });
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      expect(mockPlayWinChime).not.toHaveBeenCalled();
    });

    it('does not play win chime on mount when phase starts as validating', () => {
      renderFeedback({ moveCount: 1, phase: 'validating', underPar: false });
      expect(mockPlayWinChime).not.toHaveBeenCalled();
    });
  });

  describe('win vibration', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'vibrate', {
        value: vi.fn(),
        configurable: true,
      });
    });

    it('vibrates a pattern on win when haptics is on', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      expect(navigator.vibrate).toHaveBeenCalledWith([50, 50, 100]);
    });

    it('does not vibrate on win when haptics is off', () => {
      mockUseSettings.mockReturnValue({ audio: true, haptics: false });
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      expect(navigator.vibrate).not.toHaveBeenCalled();
    });
  });

  describe('under-par feedback', () => {
    it('plays under-par accent at validating when underPar is true', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: true });
      expect(mockPlayUnderPar).toHaveBeenCalledOnce();
    });

    it('does not play under-par when underPar is false', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      expect(mockPlayUnderPar).not.toHaveBeenCalled();
    });

    it('does not play under-par when audio is off even if underPar is true', () => {
      mockUseSettings.mockReturnValue({ audio: false, haptics: true });
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: true });
      expect(mockPlayUnderPar).not.toHaveBeenCalled();
    });

    it('does not play under-par on subsequent validating re-renders', () => {
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: true });
      expect(mockPlayUnderPar).toHaveBeenCalledOnce();
      rerender({ moveCount: 1, phase: 'validating', underPar: true });
      expect(mockPlayUnderPar).toHaveBeenCalledOnce();
    });

    it('does not play under-par when dailyPar is null (underPar is false)', () => {
      // underPar=false represents the dailyPar==null case (computed in GameScreen)
      const { rerender } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      rerender({ moveCount: 1, phase: 'validating', underPar: false });
      expect(mockPlayUnderPar).not.toHaveBeenCalled();
    });
  });

  describe('autoplay unlock', () => {
    it('registers pointerdown and keydown listeners on mount', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      expect(addSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      addSpy.mockRestore();
    });

    it('calls resume() and removes listeners on first pointerdown', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      window.dispatchEvent(new Event('pointerdown'));
      expect(mockResume).toHaveBeenCalledOnce();
      expect(removeSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      removeSpy.mockRestore();
    });

    it('removes listeners on unmount', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderFeedback({ moveCount: 0, phase: 'playing', underPar: false });
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      removeSpy.mockRestore();
    });
  });
});

import { useEffect, useRef } from 'react';
import { resume, playTap, playWinChime, playUnderPar } from '../audio/sounds';
import { useSettings } from './useSettings';
import type { GamePhase } from './useGame';

interface GameFeedbackArgs {
  moveCount: number;
  phase: GamePhase;
  underPar: boolean;
}

export function useGameFeedback({ moveCount, phase, underPar }: GameFeedbackArgs): void {
  const { audio, haptics } = useSettings();
  const prevMoveCount = useRef(moveCount);
  const prevPhase = useRef(phase);

  // One-time autoplay unlock on the first user gesture.
  useEffect(() => {
    const unlock = () => {
      resume();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Tap: fires when moveCount increases while phase is 'playing'.
  // The completing move transitions to 'validating' in the same render,
  // so phase is already 'validating' here — no tap/chime overlap.
  useEffect(() => {
    if (phase === 'playing' && moveCount > prevMoveCount.current) {
      if (audio) playTap();
      if (haptics && 'vibrate' in navigator) navigator.vibrate(15);
    }
    prevMoveCount.current = moveCount;
  }, [moveCount, phase, audio, haptics]);

  // Win + under-par: fires exactly once on the 'validating' transition.
  useEffect(() => {
    if (phase === 'validating' && prevPhase.current !== 'validating') {
      if (audio) playWinChime();
      if (haptics && 'vibrate' in navigator) navigator.vibrate([50, 50, 100]);
      if (audio && underPar) playUnderPar();
    }
    prevPhase.current = phase;
  }, [phase, underPar, audio, haptics]);
}

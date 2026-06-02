import { useState } from 'react';
import { loadSettings, setAudioPref, setHapticsPref } from '../persistence/settings';

export function useSettings() {
  const [audio, setAudioState] = useState<boolean>(() => loadSettings().audio);
  const [haptics, setHapticsState] = useState<boolean>(() => loadSettings().haptics);

  const setAudio = (value: boolean) => {
    setAudioPref(value);
    setAudioState(value);
  };

  const setHaptics = (value: boolean) => {
    setHapticsPref(value);
    setHapticsState(value);
  };

  return { audio, haptics, setAudio, setHaptics };
}

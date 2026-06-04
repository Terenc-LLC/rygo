const STORAGE_KEY = 'rygo:settings';
const CURRENT_VERSION = 1;

export interface Settings {
  audio: boolean;
  haptics: boolean;
}

interface SettingsBlob {
  version: number;
  audio: boolean;
  haptics: boolean;
}

function defaults(): Settings {
  return { audio: true, haptics: true };
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return defaults();
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).version !== 'number'
    ) {
      return defaults();
    }
    const blob = parsed as SettingsBlob;
    if (blob.version > CURRENT_VERSION) return defaults();
    return {
      audio: typeof blob.audio === 'boolean' ? blob.audio : true,
      haptics: typeof blob.haptics === 'boolean' ? blob.haptics : true,
    };
  } catch {
    return defaults();
  }
}

function persist(settings: Settings): void {
  try {
    const blob: SettingsBlob = { version: CURRENT_VERSION, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
  } catch {
    // localStorage unavailable — silently skip
  }
}

export function setAudioPref(value: boolean): void {
  persist({ ...loadSettings(), audio: value });
}

export function setHapticsPref(value: boolean): void {
  persist({ ...loadSettings(), haptics: value });
}

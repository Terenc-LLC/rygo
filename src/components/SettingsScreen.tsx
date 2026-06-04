import type { JSX } from 'react';
import { useSettings } from '../hooks/useSettings';

interface SettingsScreenProps {
  onBack: () => void;
}

interface ToggleRowProps {
  label: string;
  ariaLabel: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  id: string;
}

function ToggleRow({ label, ariaLabel, checked, onChange, id }: ToggleRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between py-3">
      <label htmlFor={id} className="text-sm text-ink dark:text-paper">
        {label}
      </label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-label={ariaLabel}
        aria-checked={checked}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-10 h-6 appearance-none rounded-full cursor-pointer relative
          bg-gray-300 dark:bg-gray-600
          checked:bg-rygo-green
          transition-colors
          after:content-[''] after:absolute after:top-1 after:left-1
          after:w-4 after:h-4 after:rounded-full after:bg-white
          after:transition-transform
          checked:after:translate-x-4"
      />
    </div>
  );
}

export function SettingsScreen({ onBack }: SettingsScreenProps): JSX.Element {
  const { audio, haptics, setAudio, setHaptics } = useSettings();
  const hasVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return (
    <div
      className="flex flex-col gap-6 px-4 py-4 w-full max-w-sm mx-auto"
      data-testid="settings-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={onBack}
          aria-label="Back to difficulty picker"
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-ink dark:hover:text-paper transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1 className="text-base font-semibold text-ink dark:text-paper">Settings</h1>
        <div className="w-12" />
      </div>

      {/* Toggles */}
      <div
        className="w-full divide-y divide-gray-200 dark:divide-gray-700"
        data-testid="settings-toggles"
      >
        <ToggleRow
          id="settings-audio"
          label="Sound"
          ariaLabel="Sound"
          checked={audio}
          onChange={setAudio}
        />
        {hasVibrate && (
          <ToggleRow
            id="settings-haptics"
            label="Haptics"
            ariaLabel="Haptics"
            checked={haptics}
            onChange={setHaptics}
          />
        )}
      </div>

      {/* Privacy */}
      <div className="w-full flex flex-col gap-1" data-testid="settings-privacy">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Privacy
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No account, no personal data. Your device gets a random ID to record daily leaderboard
          scores — that's all.
        </p>
      </div>
    </div>
  );
}

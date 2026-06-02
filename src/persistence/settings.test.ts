import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, setAudioPref, setHapticsPref } from './settings';

describe('settings persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when localStorage is empty', () => {
    expect(loadSettings()).toEqual({ audio: true, haptics: true });
  });

  it('returns defaults on corrupt JSON', () => {
    localStorage.setItem('rygo:settings', 'not-json{{{');
    expect(loadSettings()).toEqual({ audio: true, haptics: true });
  });

  it('returns defaults when version is missing', () => {
    localStorage.setItem('rygo:settings', JSON.stringify({ audio: false, haptics: false }));
    expect(loadSettings()).toEqual({ audio: true, haptics: true });
  });

  it('returns defaults when version is ahead of current', () => {
    localStorage.setItem('rygo:settings', JSON.stringify({ version: 99, audio: false, haptics: false }));
    expect(loadSettings()).toEqual({ audio: true, haptics: true });
  });

  it('loads persisted values', () => {
    localStorage.setItem('rygo:settings', JSON.stringify({ version: 1, audio: false, haptics: true }));
    expect(loadSettings()).toEqual({ audio: false, haptics: true });
  });

  it('setAudioPref persists immediately and survives reload', () => {
    setAudioPref(false);
    expect(loadSettings().audio).toBe(false);
  });

  it('setHapticsPref persists immediately and survives reload', () => {
    setHapticsPref(false);
    expect(loadSettings().haptics).toBe(false);
  });

  it('setAudioPref does not clobber haptics', () => {
    setHapticsPref(false);
    setAudioPref(false);
    expect(loadSettings().haptics).toBe(false);
  });

  it('setHapticsPref does not clobber audio', () => {
    setAudioPref(false);
    setHapticsPref(false);
    expect(loadSettings().audio).toBe(false);
  });

  it('toggling one key does not clobber the other when both are non-default', () => {
    setAudioPref(false);
    setHapticsPref(false);
    setAudioPref(true);
    expect(loadSettings()).toEqual({ audio: true, haptics: false });
  });

  it('stored blob is versioned', () => {
    setAudioPref(true);
    const raw = JSON.parse(localStorage.getItem('rygo:settings')!);
    expect(raw.version).toBe(1);
  });
});

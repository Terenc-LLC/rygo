import { describe, it, expect } from 'vitest';
import { buildShareString } from './shareString';

function baseInput(overrides: Partial<Parameters<typeof buildShareString>[0]> = {}) {
  return {
    date: '2026-05-24',
    gridSize: 5 as const,
    label: 'Normal' as const,
    moves: 14,
    elapsedMs: 161000,
    streak: 12,
    mode: 'daily' as const,
    ...overrides,
  };
}

function timeFromResult(result: string): string {
  return result.split('\n')[1].split(' · ')[1];
}

describe('buildShareString', () => {
  it('daily 4×4 with streak — snapshot', () => {
    expect(
      buildShareString({
        date: '2026-05-24',
        gridSize: 4,
        label: 'Easy',
        moves: 10,
        elapsedMs: 65000,
        streak: 7,
        mode: 'daily',
      }),
    ).toMatchSnapshot();
  });

  it('practice 8×8 — snapshot (tagged, no streak)', () => {
    expect(
      buildShareString({
        date: '2026-05-24',
        gridSize: 8,
        label: 'Extreme',
        moves: 25,
        elapsedMs: 161000,
        streak: 5,
        mode: 'practice',
      }),
    ).toMatchSnapshot();
  });

  describe('time formatting', () => {
    it('0ms → 0:00', () => expect(timeFromResult(buildShareString(baseInput({ elapsedMs: 0 })))).toBe('0:00'));
    it('9000ms → 0:09', () => expect(timeFromResult(buildShareString(baseInput({ elapsedMs: 9000 })))).toBe('0:09'));
    it('65000ms → 1:05', () => expect(timeFromResult(buildShareString(baseInput({ elapsedMs: 65000 })))).toBe('1:05'));
    it('600000ms → 10:00', () => expect(timeFromResult(buildShareString(baseInput({ elapsedMs: 600000 })))).toBe('10:00'));
  });

  describe('streak line omission', () => {
    it('omits streak line when mode is practice', () => {
      const result = buildShareString(baseInput({ mode: 'practice', streak: 10 }));
      expect(result).not.toContain('streak');
    });

    it('omits streak line when streak is 0', () => {
      const result = buildShareString(baseInput({ streak: 0 }));
      expect(result).not.toContain('streak');
    });

    it('omits streak line when streak is null', () => {
      const result = buildShareString(baseInput({ streak: null }));
      expect(result).not.toContain('streak');
    });
  });

  it('practice header is tagged with · Practice', () => {
    const result = buildShareString(baseInput({ mode: 'practice' }));
    expect(result.split('\n')[0]).toMatch(/· Practice$/);
  });

  it('daily header is not tagged with Practice', () => {
    const result = buildShareString(baseInput({ mode: 'daily' }));
    expect(result.split('\n')[0]).not.toContain('Practice');
  });

  it('includes streak line for daily with streak > 0', () => {
    const result = buildShareString(baseInput({ streak: 12 }));
    expect(result).toContain('🔥 12-day streak');
  });

  it('does not include a bare domain line', () => {
    const result = buildShareString(baseInput());
    expect(result).not.toContain('playRYGO.com');
  });

  it('output contains no board or cell emoji', () => {
    const result = buildShareString(baseInput());
    expect(result).not.toMatch(/🟥|🟨|🟩|⬛|⬜/);
  });
});

import { describe, it, expect } from 'vitest';
import { displayedPar, PAR_SLACK } from './parDisplay';

describe('displayedPar', () => {
  it('returns null when raw is null', () => {
    expect(displayedPar(null)).toBeNull();
  });

  it('adds +1 offset (PAR_SLACK) to a raw par value', () => {
    expect(displayedPar(10)).toBe(11);
    expect(displayedPar(5)).toBe(6);
    expect(displayedPar(0)).toBe(1);
  });

  it('PAR_SLACK is 1', () => {
    expect(PAR_SLACK).toBe(1);
  });

  it('adds exactly PAR_SLACK to any positive input', () => {
    expect(displayedPar(20)).toBe(20 + PAR_SLACK);
    expect(displayedPar(1)).toBe(1 + PAR_SLACK);
  });
});

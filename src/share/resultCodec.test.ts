import { describe, it, expect } from 'vitest';
import { encodeResult, decodeResult } from './resultCodec';

describe('resultCodec', () => {
  describe('round-trip', () => {
    it('encodes and decodes a full payload (with par)', () => {
      const input = { d: '20260605', s: 4 as const, m: 7, p: 5 };
      const encoded = encodeResult(input);
      const decoded = decodeResult(encoded);
      expect(decoded).toEqual({ v: 1, d: '20260605', s: 4, m: 7, p: 5 });
    });

    it('encodes and decodes a payload without par', () => {
      const input = { d: '20260605', s: 5 as const, m: 12 };
      const encoded = encodeResult(input);
      const decoded = decodeResult(encoded);
      expect(decoded).toEqual({ v: 1, d: '20260605', s: 5, m: 12, p: undefined });
    });

    it('round-trips all four grid sizes', () => {
      const sizes = [4, 5, 6, 8] as const;
      for (const s of sizes) {
        const encoded = encodeResult({ d: '20260101', s, m: 10, p: 8 });
        const decoded = decodeResult(encoded);
        expect(decoded?.s).toBe(s);
      }
    });

    it('round-trips moves = 1 (minimum play)', () => {
      const encoded = encodeResult({ d: '20260605', s: 4 as const, m: 1 });
      const decoded = decodeResult(encoded);
      expect(decoded?.m).toBe(1);
    });

    it('round-trips large move counts', () => {
      const encoded = encodeResult({ d: '20261231', s: 8 as const, m: 999, p: 20 });
      const decoded = decodeResult(encoded);
      expect(decoded?.m).toBe(999);
      expect(decoded?.p).toBe(20);
    });

    it('encoded string is URL-safe (no +, /, or = chars)', () => {
      const encoded = encodeResult({ d: '20260605', s: 6 as const, m: 15, p: 12 });
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it('encoded string is compact (~20-30 chars)', () => {
      const encoded = encodeResult({ d: '20260605', s: 4 as const, m: 7, p: 5 });
      expect(encoded.length).toBeGreaterThan(10);
      expect(encoded.length).toBeLessThan(40);
    });
  });

  describe('decodeResult — invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(decodeResult('')).toBeNull();
    });

    it('returns null for garbage input', () => {
      expect(decodeResult('not-valid-base64url!!!!')).toBeNull();
    });

    it('returns null when size is invalid', () => {
      // Manually encode a payload with size=7 (not in [4,5,6,8])
      const bad = btoa('1|20260605|7|10').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      expect(decodeResult(bad)).toBeNull();
    });

    it('returns null when date format is wrong', () => {
      const bad = btoa('1|2026-06-05|4|10').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      expect(decodeResult(bad)).toBeNull();
    });

    it('returns null when moves is negative', () => {
      const bad = btoa('1|20260605|4|-1').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      expect(decodeResult(bad)).toBeNull();
    });

    it('returns null when too few parts', () => {
      const bad = btoa('1|20260605|4').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      expect(decodeResult(bad)).toBeNull();
    });

    it('returns null when too many parts', () => {
      const bad = btoa('1|20260605|4|10|5|extra').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      expect(decodeResult(bad)).toBeNull();
    });

    it('p undefined when par field is absent', () => {
      const encoded = encodeResult({ d: '20260605', s: 4 as const, m: 7 });
      const decoded = decodeResult(encoded);
      expect(decoded?.p).toBeUndefined();
    });
  });
});

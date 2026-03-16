import { describe, expect, it } from 'vitest';
import { getBinColors, interpolateRgbColors } from '../colors';

describe('interpolateRgbColors', () => {
  it('interpolates between two RGB colors', () => {
    // 2 colors
    expect(interpolateRgbColors({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, 2)).toEqual([
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
    ]);

    // 5 colors
    const from = { r: 0, g: 100, b: 0 };
    const to = { r: 80, g: 0, b: 255 };
    expect(interpolateRgbColors(from, to, 5)).toEqual([
      { r: 0, g: 100, b: 0 },
      { r: 20, g: 75, b: 64 },
      { r: 40, g: 50, b: 128 },
      { r: 60, g: 25, b: 191 },
      { r: 80, g: 0, b: 255 },
    ]);
  });
});

describe('getBinColors', () => {
  it('returns the bin colors by row count with PIR theme', () => {
    const colors = getBinColors(8);
    // 9 bins (8 rows + 1), symmetric red→gold→red gradient
    expect(colors.background).toHaveLength(9);
    expect(colors.shadow).toHaveLength(9);
    // First and last should be the same (PIR red)
    expect(colors.background[0]).toBe(colors.background[8]);
    // Middle should be gold
    expect(colors.background[4]).toBe('rgb(255, 215, 0)');
    // Ends should be PIR red
    expect(colors.background[0]).toBe('rgb(227, 24, 55)');
  });

  it('handles odd and even bin counts', () => {
    // 9 rows = 10 bins (even)
    const even = getBinColors(9);
    expect(even.background).toHaveLength(10);
    // Should be symmetric
    expect(even.background[0]).toBe(even.background[9]);

    // 10 rows = 11 bins (odd)
    const odd = getBinColors(10);
    expect(odd.background).toHaveLength(11);
    expect(odd.background[0]).toBe(odd.background[10]);
  });
});

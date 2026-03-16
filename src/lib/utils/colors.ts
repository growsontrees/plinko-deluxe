import type { RowCount } from '$lib/types';

type RgbColor = { r: number; g: number; b: number };

/**
 * Creates a gradient of RGB colors of length `length`.
 *
 * @param from The starting RGB color.
 * @param to The ending RGB color.
 * @param length Number of colors in the output array. Must be `>= 2` since the first
 * and last color are `from` and `to`.
 */
export function interpolateRgbColors(from: RgbColor, to: RgbColor, length: number): RgbColor[] {
  return Array.from({ length }, (_, i) => ({
    r: Math.round(from.r + ((to.r - from.r) / (length - 1)) * i),
    g: Math.round(from.g + ((to.g - from.g) / (length - 1)) * i),
    b: Math.round(from.b + ((to.b - from.b) / (length - 1)) * i),
  }));
}

/** Price Is Right theme color constants */
export const themeColors = {
  red: { r: 227, g: 24, b: 55 },     // #E31837
  gold: { r: 255, g: 215, b: 0 },     // #FFD700
  blue: { r: 30, g: 58, b: 138 },     // #1E3A8A
  green: { r: 34, g: 197, b: 94 },    // #22C55E
  pink: { r: 236, g: 72, b: 153 },    // #EC4899
} as const;

/**
 * Gets the background and shadow colors of each bin given the row count.
 * Uses Price Is Right red→gold gradient.
 */
export function getBinColors(rowCount: RowCount) {
  const binCount = rowCount + 1;
  const isBinsEven = binCount % 2 === 0;
  const redToGoldLength = Math.ceil(binCount / 2);

  const redToGoldBg = interpolateRgbColors(
    { r: 227, g: 24, b: 55 },   // PIR Red
    { r: 255, g: 215, b: 0 },    // PIR Gold
    redToGoldLength,
  ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

  const redToGoldShadow = interpolateRgbColors(
    { r: 166, g: 0, b: 4 },
    { r: 171, g: 145, b: 0 },
    redToGoldLength,
  ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

  return {
    background: [...redToGoldBg, ...redToGoldBg.toReversed().slice(isBinsEven ? 0 : 1)],
    shadow: [...redToGoldShadow, ...redToGoldShadow.toReversed().slice(isBinsEven ? 0 : 1)],
  };
}

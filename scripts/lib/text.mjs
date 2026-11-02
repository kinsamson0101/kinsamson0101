// Text as vector paths. An SVG shown through <img> cannot load web fonts, so every glyph is
// converted to a path: the profile looks the same on every OS, Vietnamese diacritics included.
import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';

const load = (weight) => {
  const buf = readFileSync(new URL(`../fonts/BeVietnamPro-${weight}.ttf`, import.meta.url));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};

export const F = {
  black: load('Black'),
  xbold: load('ExtraBold'),
  semi: load('SemiBold'),
  medium: load('Medium'),
};

// NFC so Vietnamese uses precomposed glyphs; drops characters the font cannot draw (emoji etc.).
export function clean(font, s) {
  return [...String(s).normalize('NFC')]
    .filter((ch) => /\s/.test(ch) || font.charToGlyphIndex(ch) > 0)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

export const measure = (font, s, size, ls = 0) => font.getAdvanceWidth(s, size, { letterSpacing: ls });

// Returns path data for one line. anchor: start | middle | end.
export function line(font, s, x, y, size, { anchor = 'start', ls = 0 } = {}) {
  const w = measure(font, s, size, ls);
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return font.getPath(s, x0, y, size, { letterSpacing: ls }).toPathData(1);
}

// Shortens s with an ellipsis until it fits maxW.
export function fit(font, s, size, maxW) {
  if (measure(font, s, size) <= maxW) return s;
  let out = s;
  while (out.length > 1 && measure(font, `${out}…`, size) > maxW) out = out.slice(0, -1).trimEnd();
  return `${out}…`;
}

// Word-wraps s into at most maxLines lines of maxW; the last line gets an ellipsis if text remains.
export function wrap(font, s, size, maxW, maxLines) {
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (let i = 0; i < words.length; i++) {
    const next = cur ? `${cur} ${words[i]}` : words[i];
    if (measure(font, next, size) <= maxW) {
      cur = next;
      continue;
    }
    if (lines.length === maxLines - 1) {
      lines.push(fit(font, `${next} ${words.slice(i + 1).join(' ')}`.trim(), size, maxW));
      return lines;
    }
    if (cur) lines.push(cur);
    cur = measure(font, words[i], size) <= maxW ? words[i] : fit(font, words[i], size, maxW);
  }
  if (cur) lines.push(cur);
  return lines;
}

// Width of s after each character, for the typing effect: [w(s[0]), w(s[0..1]), ...].
export const prefixWidths = (font, s, size) => [...s].map((_, i) => measure(font, [...s].slice(0, i + 1).join(''), size));

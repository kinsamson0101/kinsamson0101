// Hero banner: wordmark, one-line promise, a typing line that cycles through what gets built,
// and the swinging "0₫" price tag.
import { C, svgDoc, pegboard, reducedMotion } from '../lib/theme.mjs';
import { F, line, measure, prefixWidths } from '../lib/text.mjs';
import { priceTag, peg } from '../lib/tag.mjs';

const W = 1280;
const H = 340;
const X = 84;

const COPY = {
  wordmark: 'kinsamson',
  tagline: 'Free tools for people who make money online.',
  prompt: '›',
  words: ['auto-job runners', 'Telegram bots', 'data scrapers', 'browser automation', 'tool MMO miễn phí'],
};

// Typing rhythm, seconds.
const TYPE = 0.07;
const HOLD = 1.7;
const ERASE = 0.03;
const GAP = 0.35;

function typingLine(y, size) {
  const promptW = measure(F.semi, COPY.prompt, size);
  const x = X + promptW + 14;
  const words = COPY.words.map((w) => ({ text: w, steps: prefixWidths(F.semi, w, size) }));

  // Timeline of (time, width) per word, then one caret timeline over all of them.
  let t = 0;
  const timelines = words.map((w) => {
    const pts = [[t, 0]];
    w.steps.forEach((width, i) => pts.push([t + (i + 1) * TYPE, width]));
    t += w.steps.length * TYPE + HOLD;
    for (let i = w.steps.length - 2; i >= 0; i--) pts.push([t + (w.steps.length - 1 - i) * ERASE, w.steps[i]]);
    t += w.steps.length * ERASE;
    pts.push([t, 0]);
    t += GAP;
    return pts;
  });
  const T = t;
  const smil = (pts, map) => {
    const clean = [[0, map(0)]];
    for (const [time, v] of pts) {
      const k = +(time / T).toFixed(4);
      if (k <= clean[clean.length - 1][0]) clean[clean.length - 1][1] = map(v);
      else clean.push([k, map(v)]);
    }
    return `keyTimes="${clean.map((p) => p[0]).join(';')}" values="${clean.map((p) => p[1].toFixed(1)).join(';')}"`;
  };

  const top = y - size;
  const clips = timelines
    .map(
      (pts, i) =>
        `<clipPath id="w${i}"><rect x="${x - 2}" y="${top - 6}" height="${size * 1.6}" width="0"><animate attributeName="width" dur="${T.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" ${smil(pts, (v) => (v ? v + 4 : 0))}/></rect></clipPath>`,
    )
    .join('\n');
  const paths = words
    .map((w, i) => `<path clip-path="url(#w${i})" d="${line(F.semi, w.text, x, y, size)}" fill="${C.tag}"/>`)
    .join('\n');
  const caretPts = timelines.flat().sort((a, b) => a[0] - b[0]);
  const caret = `<rect class="caret" y="${top + 2}" width="3" height="${size * 1.05}" rx="1.5" fill="${C.tag}" x="${x}"><animate attributeName="x" dur="${T.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" ${smil(caretPts, (v) => x + v + 5)}/></rect>`;
  const still = `<path class="still" d="${line(F.semi, COPY.words[0], x, y, size)}" fill="${C.tag}"/>`;

  return `<path d="${line(F.semi, COPY.prompt, X, y, size)}" fill="${C.muted}"/>
<g class="typing">
${clips}
${paths}
${caret}
</g>
${still}`;
}

export function banner() {
  const PEG = { x: 1040, y: 30 };
  const style = `
.swing{transform-origin:${PEG.x}px ${PEG.y}px;animation:swing 3.6s ease-in-out infinite alternate}
@keyframes swing{from{transform:rotate(-5deg)}to{transform:rotate(4deg)}}
.caret{animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.still{display:none}
${reducedMotion('.swing{animation:none;transform:rotate(-3deg)}.typing,.gleam{display:none}.still{display:inline}')}`;

  const body = `<clipPath id="card"><rect width="${W}" height="${H}" rx="28"/></clipPath>
<g clip-path="url(#card)">
<rect width="${W}" height="${H}" fill="${C.ground}"/>
<rect width="${W}" height="${H}" fill="url(#board)"/>
</g>
<path d="${line(F.xbold, COPY.wordmark, X - 4, 150, 112, { ls: -0.025 })}" fill="${C.text}"/>
<path d="${line(F.medium, COPY.tagline, X, 206, 31)}" fill="${C.soft}"/>
${typingLine(262, 30)}
<g class="swing"><g transform="translate(${PEG.x} ${PEG.y})">
${priceTag({ id: 'hero', note: 'mọi tool ở đây', shine: true })}
</g></g>
${peg(PEG.x, PEG.y)}`;

  return svgDoc({
    w: W,
    h: H,
    title: 'kinsamson',
    desc: `${COPY.tagline} Building: ${COPY.words.join(', ')}. A price tag reads 0₫, mọi tool ở đây.`,
    style,
    defs: pegboard('board'),
    body,
  });
}

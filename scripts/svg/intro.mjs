// The intro card: who this is, a typing line that cycles through what gets built, and two promises,
// in Vietnamese or English depending on the visitor's browser (see lib/lang.mjs).
// It sits left of the tag card in one row, so the SVG carries a transparent strip on its right
// that becomes the gutter between the two cards.
import { C, svgDoc, reducedMotion } from '../lib/theme.mjs';
import { F, line, measure, prefixWidths } from '../lib/text.mjs';
import { CARD_H, GUTTER, LEFT_W, ROW1_PAD } from '../lib/grid.mjs';
import { bilingual } from '../lib/lang.mjs';

const X = 34;
const WORDMARK = 'kinsamson';
const PROMPT = '›';

// 24x24 line icons, stroked so they can draw themselves in.
const ICONS = {
  code: ['M8 7l-5 5 5 5', 'M16 7l5 5-5 5', 'M13.6 4.5l-3.2 15'],
  shield: ['M12 2.6l8 3v6.1c0 5-3.4 8.6-8 9.9-4.6-1.3-8-4.9-8-9.9V5.6z', 'M8.4 12.1l2.6 2.6 4.8-5'],
  unlock: ['M6 11h12a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-7A1.5 1.5 0 0 1 6 11z', 'M8 11V7.5a4 4 0 0 1 7.6-1.8', 'M12 15v2.4'],
};

// Copy per language. Each promise has a `narrow` label for phones, where the card is shrunk and
// the row is set larger. `narrow` gives [shift down px, scale] for the typing line and the
// promises below 420px rendered width.
const COPY = {
  vi: {
    tagline: { text: 'Tool MMO miễn phí, mã nguồn mở.', size: 24 },
    taglineNarrow: null,
    words: ['tool auto job', 'bot Telegram', 'tool cào dữ liệu', 'auto trình duyệt', 'tool theo yêu cầu'],
    promises: [
      { icon: 'shield', wide: 'Không lấy cookie, token', narrow: 'Không lấy token' },
      { icon: 'unlock', wide: 'Không cần key', narrow: 'Không cần key' },
    ],
    narrow: { typing: [3, 1.15], promises: [0, 1.25] },
  },
  en: {
    tagline: { text: 'Free tools for people who make money online.', size: 20 },
    taglineNarrow: ['Free tools for people', 'who make money online.'],
    words: ['auto-job runners', 'Telegram bots', 'data scrapers', 'browser automation', 'custom tools'],
    promises: [
      { icon: 'code', wide: 'Open source', narrow: 'Open source' },
      { icon: 'shield', wide: 'No token grabbing', narrow: 'No token grabbing' },
    ],
    narrow: { typing: [26, 1.15], promises: [13, 1.25] },
  },
};

// Text must end at least this far inside the card's right edge, in every variant.
const LIMIT = LEFT_W - 20;
const check = (what, right) => {
  if (right > LIMIT) throw new Error(`intro: ${what} overflows the card (${right.toFixed(0)}px > ${LIMIT}px)`);
};
const shift = ([dy, s]) => `translateY(${dy}px) scale(${s})`;

// Baselines of the three lines under the wordmark.
const Y = { tagline: 129, typing: 171, promises: 227 };

// Typing rhythm, seconds.
const TYPE = 0.07;
const HOLD = 1.7;
const ERASE = 0.03;
const PAUSE = 0.35;

function typingLine(lang, words, y, size) {
  const promptW = measure(F.semi, PROMPT, size);
  const x = X + promptW + 12;
  const list = words.map((w) => ({ text: w, steps: prefixWidths(F.semi, w, size) }));

  // One (time, visible width) timeline per word, then a caret that follows all of them.
  let t = 0;
  const timelines = list.map((w) => {
    const pts = [[t, 0]];
    w.steps.forEach((width, i) => pts.push([t + (i + 1) * TYPE, width]));
    t += w.steps.length * TYPE + HOLD;
    for (let i = w.steps.length - 2; i >= 0; i--) pts.push([t + (w.steps.length - 1 - i) * ERASE, w.steps[i]]);
    t += w.steps.length * ERASE;
    pts.push([t, 0]);
    t += PAUSE;
    return pts;
  });
  const T = t;
  const smil = (pts, map) => {
    const out = [[0, map(0)]];
    for (const [time, v] of pts) {
      const k = +(time / T).toFixed(4);
      if (k <= out[out.length - 1][0]) out[out.length - 1][1] = map(v);
      else out.push([k, map(v)]);
    }
    return `keyTimes="${out.map((p) => p[0]).join(';')}" values="${out.map((p) => p[1].toFixed(1)).join(';')}"`;
  };

  const top = y - size;
  const clips = timelines
    .map(
      (pts, i) =>
        `<clipPath id="${lang}-w${i}"><rect x="${x - 2}" y="${top - 6}" height="${size * 1.6}" width="0"><animate attributeName="width" dur="${T.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" ${smil(pts, (v) => (v ? v + 4 : 0))}/></rect></clipPath>`,
    )
    .join('\n');
  const paths = list
    .map((w, i) => `<path clip-path="url(#${lang}-w${i})" d="${line(F.semi, w.text, x, y, size)}" fill="${C.tag}"/>`)
    .join('\n');
  const caretPts = timelines.flat().sort((a, b) => a[0] - b[0]);
  const caret = `<rect class="caret" y="${top + 3}" width="2.5" height="${size * 1.02}" rx="1.25" fill="${C.tag}" x="${x}"><animate attributeName="x" dur="${T.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" ${smil(caretPts, (v) => x + v + 4)}/></rect>`;
  // Shown instead of the animation when the visitor asks for less motion.
  const still = `<path class="still" d="${line(F.semi, words[1], x, y, size)}" fill="${C.tag}"/>`;

  return `<g class="ty"><path d="${line(F.semi, PROMPT, X, y, size)}" fill="${C.muted}"/>
<g class="typing">
${clips}
${paths}
${caret}
</g>
${still}</g>`;
}

// One row of promises; `variant` picks the wide or the narrow labels. Returns the markup and
// the row's right edge.
function promises(list, y, size, variant) {
  const ICON = 22;
  let x = X;
  let right = X;
  const items = list.map((p, i) => {
    const label = p[variant];
    const g = `<g class="draw d${i}" transform="translate(${x} ${y - ICON / 2 - size * 0.36}) scale(${ICON / 24})" fill="none" stroke="${C.tag}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${ICONS[p.icon].map((d) => `<path pathLength="1" d="${d}"/>`).join('')}</g>
<path d="${line(F.semi, label, x + ICON + 9, y, size)}" fill="${C.soft}"/>`;
    right = x + ICON + 9 + measure(F.semi, label, size);
    x = right + 30;
    return g;
  });
  return { markup: `<g class="${variant === 'wide' ? 'pw' : 'pn'}">${items.join('\n')}</g>`, right };
}

function block(lang) {
  const c = COPY[lang];
  const grow = (right, s) => X + (right - X) * s; // where a line ends after the narrow scale

  check(`${lang} tagline`, X + measure(F.medium, c.tagline.text, c.tagline.size));
  for (const s of c.taglineNarrow ?? []) check(`${lang} narrow tagline`, X + measure(F.medium, s, 24));
  const promptEnd = X + measure(F.semi, PROMPT, 22) + 12;
  for (const w of c.words) check(`${lang} typing "${w}"`, grow(promptEnd + measure(F.semi, w, 22), c.narrow.typing[1]));
  const wide = promises(c.promises, Y.promises, 18, 'wide');
  const narrow = promises(c.promises, Y.promises, 18, 'narrow');
  check(`${lang} promises`, wide.right);
  check(`${lang} narrow promises`, grow(narrow.right, c.narrow.promises[1]));

  const narrowTagline = c.taglineNarrow
    ? `\n<path class="tl2" d="${c.taglineNarrow.map((s, i) => line(F.medium, s, X, Y.tagline + i * 29, 24)).join('')}" fill="${C.soft}"/>`
    : '';
  return `<path class="tl" d="${line(F.medium, c.tagline.text, X, Y.tagline, c.tagline.size)}" fill="${C.soft}"/>${narrowTagline}
${typingLine(lang, c.words, Y.typing, 22)}
${wide.markup}
${narrow.markup}`;
}

// On a phone GitHub shrinks this card to ~55%. The SVG sees its own rendered width, so below
// 420px it sets the small lines larger (about 12-14px on screen).
function narrowCss() {
  const rules = Object.entries(COPY)
    .map(([lang, c]) => `.${lang} .ty{transform:${shift(c.narrow.typing)}}.${lang} .pn{transform:${shift(c.narrow.promises)}}${c.taglineNarrow ? `.${lang} .tl{display:none}` : ''}`)
    .join('\n');
  return `.tl2,.pn{display:none}
.ty{transform-origin:${X}px ${Y.typing}px}
.pn{transform-origin:${X}px ${Y.promises}px}
@media (max-width:420px){
.pw{display:none}.tl2,.pn{display:inline}
${rules}
}`;
}

export function intro() {
  const style = `
.caret{animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.still{display:none}
.draw path{stroke-dasharray:1 1.01;stroke-dashoffset:1;animation:draw 1.1s cubic-bezier(.6,0,.2,1) forwards}
.d0 path{animation-delay:.5s}.d1 path{animation-delay:.85s}
@keyframes draw{to{stroke-dashoffset:0}}
${narrowCss()}
${reducedMotion('.typing{display:none}.still{display:inline}.draw path{animation:none;stroke-dashoffset:0}')}`;

  const body = `<rect x=".75" y=".75" width="${LEFT_W - 1.5}" height="${CARD_H - 1.5}" rx="22" fill="${C.ground}" stroke="${C.line}" stroke-width="1.5"/>
<path d="${line(F.xbold, WORDMARK, X - 3, 92, 84, { ls: -0.025 })}" fill="${C.text}"/>
${bilingual({ vi: block('vi'), en: block('en') })}`;

  const describe = (c) => `${c.tagline.text} ${c.words.join(', ')}. ${c.promises.map((p) => p.wide).join('. ')}.`;
  return svgDoc({
    w: LEFT_W + GUTTER,
    h: CARD_H + ROW1_PAD,
    title: WORDMARK,
    desc: `${describe(COPY.en)} ${describe(COPY.vi)}`,
    style,
    body,
  });
}

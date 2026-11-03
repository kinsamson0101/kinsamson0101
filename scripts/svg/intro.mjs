// The intro card: who this is, a typing line that cycles through what gets built, and two promises.
// It sits left of the tag card in one row, so the SVG carries a transparent strip on its right
// that becomes the gutter between the two cards.
import { C, svgDoc, reducedMotion } from '../lib/theme.mjs';
import { F, line, measure, prefixWidths } from '../lib/text.mjs';
import { CARD_H, GUTTER, LEFT_W, ROW1_PAD } from '../lib/grid.mjs';

const X = 34;

// Written for Vietnamese MMO folks, in the words they use.
const COPY = {
  wordmark: 'kinsamson',
  tagline: 'Tool MMO miễn phí, mã nguồn mở.',
  prompt: '›',
  words: ['tool auto job', 'bot Telegram', 'tool cào dữ liệu', 'auto trình duyệt', 'tool theo yêu cầu'],
};

// 24x24 line icons, stroked so they can draw themselves in.
const ICONS = {
  shield: ['M12 2.6l8 3v6.1c0 5-3.4 8.6-8 9.9-4.6-1.3-8-4.9-8-9.9V5.6z', 'M8.4 12.1l2.6 2.6 4.8-5'],
  unlock: ['M6 11h12a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-7A1.5 1.5 0 0 1 6 11z', 'M8 11V7.5a4 4 0 0 1 7.6-1.8', 'M12 15v2.4'],
};

// `narrow` is the label used when a phone shrinks the card: shorter, so it can be set larger.
const PROMISES = [
  { icon: 'shield', wide: 'Không lấy cookie, token', narrow: 'Không lấy token' },
  { icon: 'unlock', wide: 'Không cần key', narrow: 'Không cần key' },
];

// Baselines of the three lines under the wordmark.
const Y = { tagline: 129, typing: 171, promises: 227 };

// Typing rhythm, seconds.
const TYPE = 0.07;
const HOLD = 1.7;
const ERASE = 0.03;
const PAUSE = 0.35;

function typingLine(y, size) {
  const promptW = measure(F.semi, COPY.prompt, size);
  const x = X + promptW + 12;
  const words = COPY.words.map((w) => ({ text: w, steps: prefixWidths(F.semi, w, size) }));

  // One (time, visible width) timeline per word, then a caret that follows all of them.
  let t = 0;
  const timelines = words.map((w) => {
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
        `<clipPath id="w${i}"><rect x="${x - 2}" y="${top - 6}" height="${size * 1.6}" width="0"><animate attributeName="width" dur="${T.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" ${smil(pts, (v) => (v ? v + 4 : 0))}/></rect></clipPath>`,
    )
    .join('\n');
  const paths = words
    .map((w, i) => `<path clip-path="url(#w${i})" d="${line(F.semi, w.text, x, y, size)}" fill="${C.tag}"/>`)
    .join('\n');
  const caretPts = timelines.flat().sort((a, b) => a[0] - b[0]);
  const caret = `<rect class="caret" y="${top + 3}" width="2.5" height="${size * 1.02}" rx="1.25" fill="${C.tag}" x="${x}"><animate attributeName="x" dur="${T.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" ${smil(caretPts, (v) => x + v + 4)}/></rect>`;
  const still = `<path class="still" d="${line(F.semi, COPY.words[1], x, y, size)}" fill="${C.tag}"/>`;

  return `<g class="ty"><path d="${line(F.semi, COPY.prompt, X, y, size)}" fill="${C.muted}"/>
<g class="typing">
${clips}
${paths}
${caret}
</g>
${still}</g>`;
}

// One row of promises; `variant` picks the wide or the narrow labels.
function promises(y, size, variant) {
  const ICON = 22;
  let x = X;
  const items = PROMISES.map((p, i) => {
    const label = p[variant];
    const g = `<g class="draw d${i}" transform="translate(${x} ${y - ICON / 2 - size * 0.36}) scale(${ICON / 24})" fill="none" stroke="${C.tag}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${ICONS[p.icon].map((d) => `<path pathLength="1" d="${d}"/>`).join('')}</g>
<path d="${line(F.semi, label, x + ICON + 9, y, size)}" fill="${C.soft}"/>`;
    x += ICON + 9 + measure(F.semi, label, size) + 30;
    return g;
  });
  return `<g class="${variant === 'wide' ? 'pw' : 'pn'}">${items.join('\n')}</g>`;
}

// On a phone GitHub shrinks this card to ~55%. The SVG sees its own rendered width, so below
// 420px it sets the typing line and the promises larger (about 12-14px on screen).
const NARROW = `.pn{display:none}
@media (max-width:420px){
.pw{display:none}.pn{display:inline}
.ty{transform:translateY(3px) scale(1.15)}
.pn{transform:scale(1.25)}
}
.ty{transform-origin:${X}px ${Y.typing}px}
.pn{transform-origin:${X}px ${Y.promises}px}`;

export function intro() {
  const W = LEFT_W + GUTTER;
  const style = `
.caret{animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.still{display:none}
.draw path{stroke-dasharray:1 1.01;stroke-dashoffset:1;animation:draw 1.1s cubic-bezier(.6,0,.2,1) forwards}
.d0 path{animation-delay:.5s}.d1 path{animation-delay:.85s}
@keyframes draw{to{stroke-dashoffset:0}}
${NARROW}
${reducedMotion('.typing{display:none}.still{display:inline}.draw path{animation:none;stroke-dashoffset:0}')}`;

  const body = `<rect x=".75" y=".75" width="${LEFT_W - 1.5}" height="${CARD_H - 1.5}" rx="22" fill="${C.ground}" stroke="${C.line}" stroke-width="1.5"/>
<path d="${line(F.xbold, COPY.wordmark, X - 3, 92, 84, { ls: -0.025 })}" fill="${C.text}"/>
<path d="${line(F.medium, COPY.tagline, X, Y.tagline, 24)}" fill="${C.soft}"/>
${typingLine(Y.typing, 22)}
${promises(Y.promises, 18, 'wide')}
${promises(Y.promises, 18, 'narrow')}`;

  return svgDoc({
    w: W,
    h: CARD_H + ROW1_PAD,
    title: 'kinsamson',
    desc: `${COPY.tagline} Làm: ${COPY.words.join(', ')}. ${PROMISES.map((p) => p.wide).join('. ')}.`,
    style,
    body,
  });
}

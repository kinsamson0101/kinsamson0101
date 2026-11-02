// The one marigold panel on the page: where free users become paying ones.
// Type is set large because GitHub shrinks this 800-wide image to ~45% on phones.
import { C, svgDoc, pegboard, reducedMotion } from '../lib/theme.mjs';
import { F, line, measure } from '../lib/text.mjs';
import icons from '../lib/icons.json' with { type: 'json' };

const W = 800;
const H = 244;

export function cta({ handle }) {
  const title = 'Need a custom tool?';
  const sub = 'Cần tool riêng? Nhắn mình.';
  const label = `@${handle}`;
  const X = 52;

  // Navy pill button with the Telegram mark and a nudging arrow.
  const bh = 66;
  const by = 152;
  const icon = 28;
  const size = 26;
  const labelX = X + 26 + icon + 14;
  const labelW = measure(F.xbold, label, size);
  const arrowX = labelX + labelW + 18;
  const bw = arrowX + 24 + 26 - X;
  const mid = by + bh / 2;
  const button = `<rect x="${X}" y="${by}" width="${bw.toFixed(1)}" height="${bh}" rx="${bh / 2}" fill="${C.ground}"/>
<path transform="translate(${X + 26} ${mid - icon / 2}) scale(${icon / 24})" d="${icons.telegram.path}" fill="${C.tag}"/>
<path d="${line(F.xbold, label, labelX, mid + size * 0.36, size)}" fill="${C.text}"/>
<g class="nudge"><path d="M${arrowX.toFixed(1)} ${mid}h22M${(arrowX + 13).toFixed(1)} ${mid - 8}l9 8-9 8" fill="none" stroke="${C.tag}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;

  // Large paper plane drifting at the right edge, as decoration.
  const plane = `<g class="drift" transform="translate(598 34) scale(7.6)" opacity=".1"><path d="${icons.telegram.path}" fill="${C.ground}"/></g>`;

  const style = `
.nudge{animation:nudge 1.6s ease-in-out infinite}
@keyframes nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
.drift{animation:drift 6s ease-in-out infinite alternate}
@keyframes drift{from{transform:translate(598px,34px) scale(7.6)}to{transform:translate(608px,24px) scale(7.6)}}
${reducedMotion('.nudge,.drift{animation:none}')}`;

  const body = `<clipPath id="card"><rect width="${W}" height="${H}" rx="24"/></clipPath>
<g clip-path="url(#card)">
<rect width="${W}" height="${H}" fill="${C.tag}"/>
<rect width="${W}" height="${H}" fill="url(#board)"/>
${plane}
</g>
<path d="${line(F.xbold, title, X, 90, 52, { ls: -0.01 })}" fill="${C.ground}"/>
<path d="${line(F.semi, sub, X, 130, 25)}" fill="${C.ground}" fill-opacity=".8"/>
${button}`;

  return svgDoc({ w: W, h: H, title: `${title} Telegram ${label}`, desc: sub, style, defs: pegboard('board', C.tagDark), body });
}

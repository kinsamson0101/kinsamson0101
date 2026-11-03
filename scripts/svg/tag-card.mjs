// The brand mark on its own card: a price tag hanging on a pegboard, reading "0₫" for
// Vietnamese browsers and "$0" for everyone else (see lib/lang.mjs).
// It swings in once when the page loads, settles, then keeps a slow sway.
import { C, svgDoc, pegboard, reducedMotion } from '../lib/theme.mjs';
import { priceTag, tagText, peg } from '../lib/tag.mjs';
import { CARD_H, RIGHT_W, ROW1_PAD } from '../lib/grid.mjs';
import { bilingual } from '../lib/lang.mjs';

const PEG = { x: RIGHT_W / 2, y: 30 };
const SCALE = 0.72;
const PRINTED = {
  vi: { price: '0₫', note: 'mọi tool ở đây' },
  en: { price: '$0', note: 'every tool here' },
};

export function tagCard() {
  const origin = `transform-origin:${PEG.x}px ${PEG.y}px`;
  const style = `
.settle{${origin};animation:settle 2.6s cubic-bezier(.3,.6,.4,1) both}
@keyframes settle{0%{transform:rotate(16deg)}18%{transform:rotate(-12deg)}36%{transform:rotate(8deg)}54%{transform:rotate(-4.5deg)}72%{transform:rotate(2deg)}100%{transform:rotate(0)}}
.sway{${origin};animation:sway 3.8s ease-in-out 2.6s infinite alternate}
@keyframes sway{from{transform:rotate(0)}to{transform:rotate(4deg)}}
${reducedMotion('.settle,.sway{animation:none}.sway{transform:rotate(-3deg)}.gleam{display:none}')}`;

  const text = bilingual({ vi: tagText(PRINTED.vi), en: tagText(PRINTED.en) });
  const body = `<clipPath id="card"><rect width="${RIGHT_W}" height="${CARD_H}" rx="22"/></clipPath>
<g clip-path="url(#card)">
<rect width="${RIGHT_W}" height="${CARD_H}" fill="${C.ground}"/>
<rect width="${RIGHT_W}" height="${CARD_H}" fill="url(#board)"/>
</g>
<rect x=".75" y=".75" width="${RIGHT_W - 1.5}" height="${CARD_H - 1.5}" rx="21.25" fill="none" stroke="${C.line}" stroke-width="1.5"/>
<g clip-path="url(#card)"><g class="settle"><g class="sway"><g transform="translate(${PEG.x} ${PEG.y}) scale(${SCALE})">
${priceTag({ id: 'tag', text, shine: true })}
</g></g></g></g>
${peg(PEG.x, PEG.y)}`;

  return svgDoc({
    w: RIGHT_W,
    h: CARD_H + ROW1_PAD,
    title: `${PRINTED.en.price}: ${PRINTED.en.note}. ${PRINTED.vi.price}: ${PRINTED.vi.note}.`,
    desc: 'A marigold price tag swings on a pegboard.',
    style,
    defs: pegboard('board'),
    body,
  });
}

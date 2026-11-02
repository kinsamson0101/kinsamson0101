// Shown in place of tool cards until the first public tool exists.
// 560 wide (not 800) so the text stays readable when GitHub shrinks it on phones.
import { C, svgDoc, pegboard, reducedMotion } from '../lib/theme.mjs';
import { F, line, measure, wrap } from '../lib/text.mjs';
import { priceTag, peg } from '../lib/tag.mjs';

const W = 560;
const H = 200;

export function emptyCard() {
  const title = 'First free tool';
  const title2 = 'drops soon';
  const sub = 'Tool miễn phí đầu tiên sắp lên kệ. Follow để nhận sớm nhất.';
  const x = 196;
  const subLines = wrap(F.medium, sub, 17, W - x - 28, 2);
  const title2W = measure(F.xbold, title2, 30);
  const dots = [0, 1, 2]
    .map((i) => `<circle class="dot" cx="${x + title2W + 10 + i * 12}" cy="${104 - 4}" r="3.4" fill="${C.tag}" style="animation-delay:${i * 0.2}s"/>`)
    .join('');
  const PEG = { x: 100, y: 22 };
  const style = `
.swing{transform-origin:${PEG.x}px ${PEG.y}px;animation:swing 3.2s ease-in-out infinite alternate}
@keyframes swing{from{transform:rotate(-6deg)}to{transform:rotate(5deg)}}
.dot{animation:dot 1.2s ease-in-out infinite}
@keyframes dot{0%,80%,100%{opacity:.2}40%{opacity:1}}
${reducedMotion('.swing,.dot{animation:none}')}`;
  const body = `<clipPath id="card"><rect width="${W}" height="${H}" rx="20"/></clipPath>
<g clip-path="url(#card)"><rect width="${W}" height="${H}" fill="${C.ground}"/><rect width="${W}" height="${H}" fill="url(#board)"/></g>
<g class="swing"><g transform="translate(${PEG.x} ${PEG.y}) scale(.52)">${priceTag({ id: 'soon', note: 'sắp có' })}</g></g>
${peg(PEG.x, PEG.y, 6)}
<path d="${line(F.xbold, title, x, 68, 30)}" fill="${C.text}"/>
<path d="${line(F.xbold, title2, x, 104, 30)}" fill="${C.text}"/>
${dots}
${subLines.map((l, i) => `<path d="${line(F.medium, l, x, 142 + i * 24, 17)}" fill="${C.muted}"/>`).join('\n')}`;
  return svgDoc({ w: W, h: H, title: `${title} ${title2}`, desc: sub, style, defs: pegboard('board'), body });
}

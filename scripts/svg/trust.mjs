// Three promise tiles. Their line icons draw themselves once when the page loads.
import { C, svgDoc, reducedMotion } from '../lib/theme.mjs';
import { F, line } from '../lib/text.mjs';

const W = 260;
const H = 184;

// 64x64 line icons, drawn with strokes so they can animate.
const ICONS = {
  code: ['M23 18L9 32l14 14', 'M41 18l14 14-14 14', 'M36 11l-8 42'],
  shield: ['M32 6l22 8v16c0 14-9.5 24-22 28C19.5 54 10 44 10 30V14z', 'M22 32l7 7 13-14'],
  tag: ['M34 7h21a2 2 0 0 1 2 2v21L30 57 7 34z', 'M45 19.5a3.5 3.5 0 1 0 0 .1'],
};

export function trustTile({ icon, title, sub, delay = 0 }) {
  const style = `
.draw path{stroke-dasharray:1 1.01;stroke-dashoffset:1;animation:draw 1.3s cubic-bezier(.6,0,.2,1) ${delay}s forwards}
@keyframes draw{to{stroke-dashoffset:0}}
${reducedMotion('.draw path{animation:none;stroke-dashoffset:0}')}`;
  const body = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="${C.ground}" stroke="${C.line}" stroke-width="1.5"/>
<g class="draw" transform="translate(${W / 2 - 32} 26)" fill="none" stroke="${C.tag}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
${ICONS[icon].map((d) => `<path pathLength="1" d="${d}"/>`).join('\n')}
</g>
<path d="${line(F.xbold, title, W / 2, 128, 21, { anchor: 'middle' })}" fill="${C.text}"/>
<path d="${line(F.medium, sub, W / 2, 156, 15, { anchor: 'middle' })}" fill="${C.muted}"/>`;
  return svgDoc({ w: W, h: H, title, desc: sub, style, body });
}

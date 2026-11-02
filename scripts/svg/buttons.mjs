// Contact buttons. The primary one (Telegram, where deals happen) is filled marigold.
import { C, svgDoc } from '../lib/theme.mjs';
import { F, line, measure } from '../lib/text.mjs';
import icons from '../lib/icons.json' with { type: 'json' };

const H = 52;
const SIZE = 19;
const ICON = 22;

export function button({ icon, label, primary = false }) {
  const textW = measure(F.semi, label, SIZE);
  const w = Math.ceil(22 + ICON + 11 + textW + 24);
  const fg = primary ? C.ground : C.text;
  const iconColor = primary ? C.ground : C.tag;
  const s = ICON / 24;
  const body = `<rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="${(H - 2) / 2}" fill="${primary ? C.tag : C.ground}"${primary ? '' : ` stroke="${C.line}" stroke-width="1.5"`}/>
<path transform="translate(22 ${(H - ICON) / 2}) scale(${s})" d="${icons[icon].path}" fill="${iconColor}"/>
<path d="${line(F.semi, label, 22 + ICON + 11, H / 2 + SIZE * 0.36, SIZE)}" fill="${fg}"/>`;
  return svgDoc({ w, h: H, title: label, body });
}

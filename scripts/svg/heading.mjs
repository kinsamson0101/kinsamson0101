// Section heading with a transparent background, built twice (light and dark GitHub themes)
// and switched with <picture>.
import { C, svgDoc } from '../lib/theme.mjs';
import { F, line, measure } from '../lib/text.mjs';

// Narrow on purpose: a wide canvas would shrink the text to nothing on phones.
const W = 400;
const H = 92;

export function heading({ title, sub, theme }) {
  const ink = theme === 'dark' ? C.text : C.ground;
  const subInk = theme === 'dark' ? C.muted : '#59636E';
  const size = 30;
  const titleW = measure(F.xbold, title, size);
  const iconW = 26;
  const x = (W - (iconW + 12 + titleW)) / 2;
  // Mini price tag glyph in front of the title.
  // evenodd punches a real hole, so it works on any GitHub theme background.
  const icon = `<g transform="translate(${x} 18) rotate(-12 13 18)"><path fill-rule="evenodd" d="M6 5h14l7 8v22H-1V13zM10.2 12.5a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0-5.6 0z" fill="${C.tag}"/></g>`;
  const body = `${icon}
<path d="${line(F.xbold, title, x + iconW + 12, 46, size)}" fill="${ink}"/>
<path d="${line(F.medium, sub, W / 2, 78, 16, { anchor: 'middle' })}" fill="${subInk}"/>`;
  return svgDoc({ w: W, h: H, title, desc: sub, body });
}

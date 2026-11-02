// The brand mark: a marigold price tag reading "0₫", hung by a string from a peg at (0,0).
// Used full size in the banner and scaled down on cards. Wrap it in a translated/scaled <g>.
import { C } from './theme.mjs';
import { F, line } from './text.mjs';

const TOP = 40; // string length: peg to the top of the tag
const H = 240; // tag body height
export const TAG_BODY = `M-56 ${TOP}H56L108 ${TOP + 52}V${TOP + H}H-108V${TOP + 52}Z`;

export function priceTag({ id, price = '0₫', note = '', shine = false, shadow = true }) {
  const priceD = line(F.black, price, 0, TOP + (note ? 166 : 182), 110, { anchor: 'middle', ls: -0.03 });
  const noteD = note ? line(F.semi, note, 0, TOP + 215, 20, { anchor: 'middle' }) : '';
  const filter = shadow
    ? `<filter id="${id}-drop" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#08131C" flood-opacity=".45"/></filter>`
    : '';
  // A light band that sweeps across the tag every few seconds.
  const gleam = shine
    ? `<clipPath id="${id}-clip"><path d="${TAG_BODY}"/></clipPath>
<linearGradient id="${id}-gleam" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<g class="gleam" clip-path="url(#${id}-clip)"><g transform="skewX(-18)"><rect x="-260" y="0" width="70" height="330" fill="url(#${id}-gleam)"><animate attributeName="x" values="-260;230;230" keyTimes="0;.22;1" dur="5.5s" begin="1.4s" repeatCount="indefinite"/></rect></g></g>`
    : '';
  return `${filter}
<path d="${TAG_BODY}" fill="${C.tag}" stroke="${C.tag}" stroke-width="14" stroke-linejoin="round"${shadow ? ` filter="url(#${id}-drop)"` : ''}/>
${gleam}
<circle cy="${TOP + 36}" r="17" fill="${C.tagDark}"/>
<circle cy="${TOP + 36}" r="10" fill="${C.ground}"/>
<path d="M0 0L-7 ${TOP + 30}M0 0L7 ${TOP + 30}" stroke="${C.soft}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<path d="${priceD}" fill="${C.ground}"/>
${noteD ? `<path d="${noteD}" fill="${C.ground}" fill-opacity=".72"/>` : ''}`;
}

export const peg = (x, y, r = 9) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.deep}"/><circle cx="${x - r * 0.28}" cy="${y - r * 0.28}" r="${r / 3}" fill="${C.muted}" fill-opacity=".6"/>`;

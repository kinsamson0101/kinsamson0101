// Row 2 of the grid: the Telegram call to action and two small contact tiles.
import { C, svgDoc, reducedMotion } from '../lib/theme.mjs';
import { F, line, measure } from '../lib/text.mjs';
import { GUTTER, LEFT_W, SMALL_W, TILE_H } from '../lib/grid.mjs';
import { bilingual } from '../lib/lang.mjs';
import icons from '../lib/icons.json' with { type: 'json' };

const icon = (name, x, size, fill) =>
  `<path transform="translate(${x} ${(TILE_H - size) / 2}) scale(${size / 24})" d="${icons[name].path}" fill="${fill}"/>`;

const CTA = {
  vi: { ask: 'Cần tool riêng?', action: 'Nhắn' },
  en: { ask: 'Need a custom tool?', action: 'DM' },
};

// The one marigold tile: where a free user becomes a paying one. A light band crosses it now
// and then, out of step with the gleam on the price tag. Vietnamese or English per lib/lang.mjs.
export function ctaTile({ handle }) {
  const size = 22;
  const X = 34;
  const ICON = 30;
  const y = TILE_H / 2 + size * 0.36;
  // On a phone this 528-wide tile shrinks to ~55% and would read thinner than the small tiles
  // beside it. Below 420px rendered width it switches to one large centred line.
  const nSize = 31;
  const nIcon = 40;

  const layout = ({ ask, action }) => {
    const act = `${action} @${handle}`;
    const askX = X + ICON + 13;
    const actionX = askX + measure(F.semi, ask, size) + 8;
    const right = actionX + measure(F.xbold, act, size);
    if (right > LEFT_W - 16) throw new Error(`CTA "${ask} ${act}" overflows the tile (${right.toFixed(0)}px)`);
    const nW = nIcon + 16 + measure(F.xbold, act, nSize);
    const nX = (LEFT_W - nW) / 2;
    return `<g class="wide">${icon('telegram', X, ICON, C.ground)}
<path d="${line(F.semi, ask, askX, y, size)}" fill="${C.ground}" fill-opacity=".72"/>
<path d="${line(F.xbold, act, actionX, y, size)}" fill="${C.ground}"/></g>
<g class="narrow">${icon('telegram', nX, nIcon, C.ground)}
<path d="${line(F.xbold, act, nX + nIcon + 16, TILE_H / 2 + nSize * 0.36, nSize)}" fill="${C.ground}"/></g>`;
  };

  const style = `.narrow{display:none}
@media (max-width:420px){.wide{display:none}.narrow{display:inline}}
${reducedMotion('.shine{display:none}')}`;
  const body = `<clipPath id="tile"><rect width="${LEFT_W}" height="${TILE_H}" rx="16"/></clipPath>
<rect width="${LEFT_W}" height="${TILE_H}" rx="16" fill="${C.tag}"/>
<linearGradient id="band" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<g class="shine" clip-path="url(#tile)"><g transform="skewX(-20)"><rect x="-140" y="0" width="90" height="${TILE_H}" fill="url(#band)"><animate attributeName="x" values="-140;${LEFT_W + 60};${LEFT_W + 60}" keyTimes="0;.18;1" dur="6s" begin="3.2s" repeatCount="indefinite"/></rect></g></g>
${bilingual({ vi: layout(CTA.vi), en: layout(CTA.en) })}`;
  const title = `${CTA.en.ask} ${CTA.en.action} @${handle} on Telegram. ${CTA.vi.ask} ${CTA.vi.action} @${handle} trên Telegram.`;
  return svgDoc({ w: LEFT_W + GUTTER, h: TILE_H, title, style, body });
}

// A small navy tile with a marigold logo. `gutter` adds the transparent strip when another tile follows.
export function linkTile({ name, label, gutter = 0 }) {
  const size = 17;
  const ICON = 22;
  const groupW = ICON + 9 + measure(F.semi, label, size);
  const x = (SMALL_W - groupW) / 2;
  const body = `<rect x=".75" y=".75" width="${SMALL_W - 1.5}" height="${TILE_H - 1.5}" rx="15.25" fill="${C.ground}" stroke="${C.line}" stroke-width="1.5"/>
${icon(name, x, ICON, C.tag)}
<path d="${line(F.semi, label, x + ICON + 9, TILE_H / 2 + size * 0.36, size)}" fill="${C.text}"/>`;
  return svgDoc({ w: SMALL_W + gutter, h: TILE_H, title: label, body });
}

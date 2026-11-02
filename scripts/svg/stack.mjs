// Tech stack as two endless rows of pills sliding in opposite directions.
import { C, svgDoc, reducedMotion } from '../lib/theme.mjs';
import { F, line, measure } from '../lib/text.mjs';
import icons from '../lib/icons.json' with { type: 'json' };

const W = 800;
const H = 184;
const PILL_H = 48;
const GAP = 12;
const SPEED = 34; // px per second

const ROWS = [
  [['nodedotjs', 'Node.js'], ['typescript', 'TypeScript'], ['javascript', 'JavaScript'], ['python', 'Python'], ['nextdotjs', 'Next.js'], ['react', 'React'], ['git', 'Git']],
  [['puppeteer', 'Puppeteer'], ['selenium', 'Selenium'], ['telegram', 'Telegram bots'], ['googlechrome', 'Chrome extensions'], ['docker', 'Docker'], ['mongodb', 'MongoDB'], ['githubactions', 'GitHub Actions']],
];

const pillWidth = (label) => 18 + 22 + 11 + measure(F.semi, label, 19) + 20;

// Each pill is drawn once in <defs> and placed with <use>, so repeating it costs a few bytes.
function pillDef([icon, label]) {
  const w = pillWidth(label);
  return `<g id="p-${icon}"><rect width="${w.toFixed(1)}" height="${PILL_H}" rx="${PILL_H / 2}" fill="${C.peg}"/>
<path transform="translate(18 13) scale(${22 / 24})" d="${icons[icon].path}" fill="${C.tag}"/>
<path d="${line(F.semi, label, 51, PILL_H / 2 + 6.8, 19)}" fill="${C.text}"/></g>`;
}

// Lays the row out twice in a row so translating by one copy's width loops seamlessly.
function row(items, y) {
  let seq = [...items];
  const width = (s) => s.reduce((sum, [, label]) => sum + pillWidth(label) + GAP, 0);
  while (width(seq) < W + 200) seq = seq.concat(items);
  const span = width(seq);
  let x = 0;
  const parts = [];
  for (const copy of [0, 1]) {
    for (const [icon, label] of seq) {
      parts.push(`<use href="#p-${icon}" x="${x.toFixed(1)}" y="${y}"/>`);
      x += pillWidth(label) + GAP;
    }
  }
  return { span, markup: parts.join('') };
}

export function stack() {
  const label = 'Built with';
  const r1 = row(ROWS[0], 46);
  const r2 = row(ROWS[1], 112);
  const d1 = (r1.span / SPEED).toFixed(1);
  const d2 = (r2.span / SPEED).toFixed(1);
  const style = `
.r1{animation:left ${d1}s linear infinite}
.r2{animation:right ${d2}s linear infinite}
@keyframes left{from{transform:translateX(0)}to{transform:translateX(-${r1.span.toFixed(1)}px)}}
@keyframes right{from{transform:translateX(-${r2.span.toFixed(1)}px)}to{transform:translateX(0)}}
${reducedMotion('.r1,.r2{animation:none}')}`;
  const defs = `<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset=".09" stop-color="#fff"/><stop offset=".91" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
<mask id="edges"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
<clipPath id="card"><rect width="${W}" height="${H}" rx="20"/></clipPath>
${ROWS.flat().map(pillDef).join('\n')}`;
  const body = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" fill="${C.ground}" stroke="${C.line}" stroke-width="1.5"/>
<path d="${line(F.semi, label, 26, 30, 14)}" fill="${C.muted}"/>
<g clip-path="url(#card)"><g mask="url(#edges)">
<g class="r1">${r1.markup}</g>
<g class="r2">${r2.markup}</g>
</g></g>`;
  const names = ROWS.flat().map((r) => r[1]).join(', ');
  return svgDoc({ w: W, h: H, title: `${label}: ${names}`, style, defs, body });
}

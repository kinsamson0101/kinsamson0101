// One card per free tool, regenerated daily from the repo's metadata.
import { C, svgDoc, reducedMotion } from '../lib/theme.mjs';
import { F, clean, fit, wrap, line, measure } from '../lib/text.mjs';
import { priceTag, peg } from '../lib/tag.mjs';

const W = 396;
const H = 168;
const FRESH_DAYS = 30;

const star = (x, y, r) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${C.tag}"/>`;
};

const monthYear = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export function toolCard(repo, now = Date.now()) {
  const name = fit(F.xbold, clean(F.xbold, repo.name), 22, 284);
  const desc = clean(F.medium, repo.description || '') || 'Open the repo for details.';
  const lines = wrap(F.medium, desc, 15, W - 48, 2);
  const fresh = now - Date.parse(repo.pushed_at) < FRESH_DAYS * 864e5;

  // Bottom meta row, laid out left to right.
  const y = 146;
  const size = 13;
  let x = 24;
  const meta = [];
  const text = (s, color = C.muted) => {
    meta.push(`<path d="${line(F.semi, s, x, y, size)}" fill="${color}"/>`);
    x += measure(F.semi, s, size) + 18;
  };
  if (repo.language) {
    meta.push(`<circle cx="${x + 4}" cy="${y - 4.5}" r="4" fill="${C.tag}"/>`);
    x += 14;
    text(repo.language);
  }
  if (repo.stargazers_count > 0) {
    meta.push(star(x + 6, y - 5, 6.5));
    x += 17;
    text(String(repo.stargazers_count));
  }
  if (fresh) {
    meta.push(`<circle cx="${x + 4}" cy="${y - 4.5}" r="4" fill="${C.fresh}"/><circle class="pulse" cx="${x + 4}" cy="${y - 4.5}" r="4" fill="none" stroke="${C.fresh}" stroke-width="2"><animate attributeName="r" values="4;11" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="1.8s" repeatCount="indefinite"/></circle>`);
    x += 14;
    text(`updated ${monthYear(repo.pushed_at)}`, C.fresh);
  } else {
    text(`updated ${monthYear(repo.pushed_at)}`);
  }

  const body = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="${C.ground}" stroke="${C.line}" stroke-width="1.5"/>
<path d="${line(F.xbold, name, 24, 46, 22)}" fill="${C.text}"/>
${lines.map((l, i) => `<path d="${line(F.medium, l, 24, 82 + i * 22, 15)}" fill="${C.soft}"/>`).join('\n')}
${meta.join('\n')}
<g transform="translate(352 8) rotate(-8) scale(.2)">${priceTag({ id: 'mini', shadow: false })}</g>
${peg(352, 8, 3.5)}`;

  return svgDoc({
    w: W,
    h: H,
    title: repo.name,
    desc: repo.description || '',
    style: reducedMotion('.pulse{display:none}'),
    body,
  });
}

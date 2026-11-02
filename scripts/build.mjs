// Builds every image on the profile and refreshes the tools block in README.md.
//
//   npm run build                       # all assets + tool cards for the repo owner
//   node scripts/build.mjs --user <x>   # tool cards for another account (local testing only)
//
// Env: GITHUB_TOKEN (optional, raises the API rate limit), GITHUB_REPOSITORY_OWNER (set by Actions),
//      MAX_TOOLS (default 6).
// Hide a repo from the profile by giving it the topic "hide-from-profile".
import { writeFile, readFile, mkdir, readdir, rm } from 'node:fs/promises';
import { esc } from './lib/theme.mjs';
import { fetchTools } from './lib/github.mjs';
import { banner } from './svg/banner.mjs';
import { button } from './svg/buttons.mjs';
import { trustTile } from './svg/trust.mjs';
import { heading } from './svg/heading.mjs';
import { toolCard } from './svg/tool-card.mjs';
import { emptyCard } from './svg/empty.mjs';
import { cta } from './svg/cta.mjs';
import { stack } from './svg/stack.mjs';

const TELEGRAM = 'iamsamson';

const args = process.argv.slice(2);
const userArg = args.includes('--user') ? args[args.indexOf('--user') + 1] : undefined;
const user = userArg || process.env.GITHUB_REPOSITORY_OWNER || 'kinsamson0101';
const maxTools = Number(process.env.MAX_TOOLS || 6);

const root = new URL('../', import.meta.url);
const assets = new URL('assets/', root);
const toolsDir = new URL('assets/tools/', root);
const put = (name, svg, dir = assets) => writeFile(new URL(name, dir), svg);

// ---- static images ----
await mkdir(toolsDir, { recursive: true });
await put('banner.svg', banner());
await put('btn-telegram.svg', button({ icon: 'telegram', label: 'Telegram', primary: true }));
await put('btn-facebook.svg', button({ icon: 'facebook', label: 'Facebook' }));
await put('btn-email.svg', button({ icon: 'gmail', label: 'Email' }));
await put('trust-open-source.svg', trustTile({ icon: 'code', title: 'Open source', sub: 'Soi được từng dòng code', delay: 0.2 }));
await put('trust-safe.svg', trustTile({ icon: 'shield', title: 'No token grabbing', sub: 'Không lấy cookie, token', delay: 0.45 }));
await put('trust-free.svg', trustTile({ icon: 'tag', title: 'Free forever', sub: 'Không key, không hạn dùng', delay: 0.7 }));
for (const theme of ['dark', 'light']) {
  await put(`heading-tools-${theme}.svg`, heading({ title: 'Free tools', sub: 'Tool miễn phí, tự cập nhật mỗi ngày', theme }));
}
await put('cta.svg', cta({ handle: TELEGRAM }));
await put('stack.svg', stack());

// ---- tool cards ----
const tools = await fetchTools(user);
const shown = tools.slice(0, maxTools);
const keep = new Set();
for (const repo of shown) {
  const file = `${repo.name}.svg`;
  await put(file, toolCard(repo), toolsDir);
  keep.add(file);
}
if (shown.length === 0) {
  await put('_empty.svg', emptyCard(), toolsDir);
  keep.add('_empty.svg');
}
for (const file of await readdir(toolsDir)) {
  if (!keep.has(file)) await rm(new URL(file, toolsDir));
}

// ---- README tools block ----
const START = '<!-- TOOLS:START -->';
const END = '<!-- TOOLS:END -->';
let block;
if (shown.length === 0) {
  block = `<p align="center"><img src="assets/tools/_empty.svg" width="560" alt="First free tool drops soon. Tool miễn phí đầu tiên sắp lên kệ."></p>`;
} else {
  const cards = shown
    .map((r) => {
      const alt = r.description ? `${r.name}: ${r.description}` : r.name;
      return `<a href="${r.html_url}"><img src="assets/tools/${r.name}.svg" width="396" alt="${esc(alt)}"></a>`;
    })
    .join('\n');
  const more =
    tools.length > shown.length
      ? `\n<p align="center"><a href="https://github.com/${user}?tab=repositories&type=source"><b>See all ${tools.length} tools</b></a></p>`
      : '';
  block = `<p align="center">\n${cards}\n</p>${more}`;
}

const readmeUrl = new URL('README.md', root);
const readme = await readFile(readmeUrl, 'utf8');
const s = readme.indexOf(START);
const e = readme.indexOf(END);
if (s === -1 || e === -1 || e < s) {
  console.error(`README.md must contain ${START} and ${END}, in that order.`);
  process.exit(1);
}
const next = `${readme.slice(0, s + START.length)}\n${block}\n${readme.slice(e)}`;
if (next !== readme) await writeFile(readmeUrl, next);
console.log(`Built assets; ${shown.length} of ${tools.length} tools listed for ${user}.`);

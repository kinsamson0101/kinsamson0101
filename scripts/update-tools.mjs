// Rewrites the "Free tools" block in README.md from the owner's public repos.
//
// Usage:
//   node scripts/update-tools.mjs                  # update README.md in place
//   node scripts/update-tools.mjs --stdout         # print the block, touch nothing
//   node scripts/update-tools.mjs --user <login>   # list another account (local testing)
//
// Env: GITHUB_TOKEN (optional, raises the API rate limit), GITHUB_REPOSITORY_OWNER (set by Actions),
//      MAX_TOOLS (default 6).
//
// A repo is listed when it is public, not a fork, not archived, not this profile repo, and does not
// carry the topic "hide-from-profile". Order: most stars first, then most recently pushed.
import { readFile, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const user = option('--user') || process.env.GITHUB_REPOSITORY_OWNER || 'kinsamson0101';
const toStdout = args.includes('--stdout');
const maxTools = Number(process.env.MAX_TOOLS || 6);
const readmeUrl = new URL('../README.md', import.meta.url);
const START = '<!-- TOOLS:START -->';
const END = '<!-- TOOLS:END -->';
const HIDE_TOPIC = 'hide-from-profile';

async function fetchRepos(login) {
  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'profile-tools-updater',
    'x-github-api-version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const url = `https://api.github.com/users/${login}/repos?type=owner&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status} for ${url}: ${await res.text()}`);
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Long descriptions (or pasted URLs) stretch one column of the table; keep cards even.
const shorten = (s, max = 110) => (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`);

const monthYear = (iso) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

// One stacked entry per tool: a table would scroll sideways on phones, where most visitors arrive
// from Facebook/Telegram links. On desktop, GitHub's own "Pinned" grid already gives the card view.
function entry(repo) {
  const meta = [
    repo.language,
    repo.stargazers_count > 0 ? `★ ${repo.stargazers_count}` : null,
    `updated ${monthYear(repo.pushed_at)}`,
    repo.homepage ? `<a href="${escapeHtml(repo.homepage)}">demo</a>` : null,
  ].filter(Boolean);
  const description = repo.description ? escapeHtml(shorten(repo.description)) : 'Open the repo for details.';
  return [
    `<p><a href="${repo.html_url}"><b>${escapeHtml(repo.name)}</b></a><br>`,
    `${description}<br>`,
    `<sub>${meta.join(' &nbsp;·&nbsp; ')}</sub></p>`,
  ].join('\n');
}

function render(tools, total) {
  if (tools.length === 0) {
    return '<p><i>The first tool is on its way. Follow this profile to see it the day it ships.</i></p>';
  }
  const more =
    total > tools.length
      ? ` <a href="https://github.com/${user}?tab=repositories&type=source">See all ${total}.</a>`
      : '';
  return `${tools.map(entry).join('\n')}\n\n<sub>Refreshed daily from my public repos.${more}</sub>`;
}

const all = (await fetchRepos(user))
  .filter((r) => !r.fork && !r.archived && !r.private)
  .filter((r) => r.name.toLowerCase() !== user.toLowerCase() && r.name !== '.github')
  .filter((r) => !(r.topics || []).includes(HIDE_TOPIC))
  .sort((a, b) => b.stargazers_count - a.stargazers_count || Date.parse(b.pushed_at) - Date.parse(a.pushed_at));

const block = render(all.slice(0, maxTools), all.length);

if (toStdout) {
  console.log(block);
  process.exit(0);
}

const readme = await readFile(readmeUrl, 'utf8');
const start = readme.indexOf(START);
const end = readme.indexOf(END);
if (start === -1 || end === -1 || end < start) {
  console.error(`README.md must contain ${START} and ${END}, in that order.`);
  process.exit(1);
}
const next = `${readme.slice(0, start + START.length)}\n${block}\n${readme.slice(end)}`;
if (next === readme) {
  console.log('README.md already up to date.');
} else {
  await writeFile(readmeUrl, next);
  console.log(`README.md updated: ${Math.min(all.length, maxTools)} of ${all.length} tools listed for ${user}.`);
}

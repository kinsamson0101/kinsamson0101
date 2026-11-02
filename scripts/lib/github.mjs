// Public repos that count as "tools" on the profile.
const HIDE_TOPIC = 'hide-from-profile';

export async function fetchTools(login) {
  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'kinsamson-profile-builder',
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

  return repos
    .filter((r) => !r.fork && !r.archived && !r.private)
    .filter((r) => r.name.toLowerCase() !== login.toLowerCase() && r.name !== '.github')
    .filter((r) => !(r.topics || []).includes(HIDE_TOPIC))
    .sort((a, b) => b.stargazers_count - a.stargazers_count || Date.parse(b.pushed_at) - Date.parse(a.pushed_at));
}

// Builds every image on the profile into assets/. Run after changing anything in scripts/:
//
//   npm run build
//
// The README is a fixed two-row grid (see lib/grid.mjs); the free tools themselves show up in
// GitHub's own "Pinned" / "Popular repositories" list right under it.
import { writeFile, mkdir } from 'node:fs/promises';
import { intro } from './svg/intro.mjs';
import { tagCard } from './svg/tag-card.mjs';
import { ctaTile, linkTile } from './svg/tiles.mjs';
import { GUTTER } from './lib/grid.mjs';

const assets = new URL('../assets/', import.meta.url);
await mkdir(assets, { recursive: true });

const files = {
  'intro.svg': intro(),
  'tag.svg': tagCard(),
  'btn-telegram.svg': ctaTile({ handle: 'iamsamson' }),
  'btn-facebook.svg': linkTile({ name: 'facebook', label: 'Facebook', gutter: GUTTER }),
  'btn-email.svg': linkTile({ name: 'gmail', label: 'Email' }),
};
for (const [name, svg] of Object.entries(files)) {
  await writeFile(new URL(name, assets), svg);
  console.log(`${name.padEnd(18)} ${(svg.length / 1024).toFixed(1)} KB`);
}

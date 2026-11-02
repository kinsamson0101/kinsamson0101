// Design tokens shared by every generated SVG.
export const C = {
  ground: '#172A3A', // navy card surface
  deep: '#0F1F2B', // peg, shadows
  peg: '#213A4E', // pegboard holes, pills
  line: '#2A465C', // card outlines
  text: '#EEF2F5',
  soft: '#C9D4DD',
  muted: '#8FA3B5',
  tag: '#F4C95D', // marigold price tag, primary accent
  tagDark: '#D9A93A',
  fresh: '#5CC8B0', // "recently updated" signal
};

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Wraps a body in an accessible, self-contained SVG document.
export function svgDoc({ w, h, title, desc = '', style = '', defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t${desc ? ' d' : ''}">
<title id="t">${esc(title)}</title>${desc ? `\n<desc id="d">${esc(desc)}</desc>` : ''}
<style>${style}</style>
<defs>${defs}</defs>
${body}
</svg>
`;
}

// Pegboard texture: the board the price tags hang on.
export const pegboard = (id, color = C.peg, step = 34) =>
  `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse" x="9" y="9"><circle cx="${step / 2}" cy="${step / 2}" r="2.6" fill="${color}"/></pattern>`;

// Every animation in the set stops for people who ask the OS for less motion.
export const reducedMotion = (rules) => `@media (prefers-reduced-motion:reduce){${rules}}`;

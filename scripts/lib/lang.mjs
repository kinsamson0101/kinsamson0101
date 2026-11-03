// Every image speaks Vietnamese to visitors whose browser lists Vietnamese among its preferred
// languages, and English to everyone else. SVG <switch> renders its first child whose
// systemLanguage matches. Chrome compares each value with the browser's language list as written
// (a lone "vi" in the attribute does not match a browser set to "vi-VN"), so both forms are listed.
// Checked in Chrome 156 launched with en-US, fr-FR, vi, vi-VN and vi-VN,vi,en-US,en (2026-11-03).
export const VI = 'vi, vi-VN';

export const bilingual = ({ vi, en }) => `<switch><g systemLanguage="${VI}" class="vi">${vi}</g><g class="en">${en}</g></switch>`;

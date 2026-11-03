// The profile is a two-row grid sized to GitHub's README column, which is 831px wide in a
// 1280px window and 846px from 1366px up:
//
//   row 1   [ intro card  528 ] [ tag card 288 ]
//   row 2   [ Telegram    528 ] [ FB 139 ][ Email 139 ]
//
// The images sit next to each other with no whitespace in between, so each left-hand SVG
// carries the gutter as a transparent strip on its right. The rows then line up to the pixel,
// whatever font the visitor's browser uses for the space character.
export const GUTTER = 10;
export const LEFT_W = 528;
export const RIGHT_W = 288;
export const SMALL_W = (RIGHT_W - GUTTER) / 2;
export const ROW_W = LEFT_W + GUTTER + RIGHT_W;
export const CARD_H = 260;
// Inline images sit on the text baseline, so the line box already leaves ~5px under row 1.
// Row 1 SVGs carry this transparent strip at the bottom to top that up to one gutter.
export const ROW1_PAD = GUTTER - 5;
export const TILE_H = 64;

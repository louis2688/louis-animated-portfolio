// Community palette, shared by the SVG fallback and the WebGL view so a node
// keeps its colour whichever one is on screen. Cool cyans and ice blues carry
// the bulk, with warm amber and violet as accents — reads as starfield rather
// than pie chart once the nodes are glowing.
export const GRAPH_COLORS = [
  "#7ef0ff",
  "#ffd9a0",
  "#a6c8ff",
  "#7ef0d0",
  "#ffb066",
  "#c9b8ff",
  "#4dd4ff",
  "#ff9ec4",
  "#dfe8ff",
  "#8ef7d8",
];

export const colorFor = (community: number) =>
  GRAPH_COLORS[community % GRAPH_COLORS.length];

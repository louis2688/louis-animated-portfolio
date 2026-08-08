// Community palette, shared by the SVG fallback and the WebGL view so a node
// keeps its colour whichever one is on screen.
export const GRAPH_COLORS = [
  "#ff6b6b",
  "#ffa94d",
  "#ffd43b",
  "#a9e34b",
  "#38d9a9",
  "#4dabf7",
  "#748ffc",
  "#da77f2",
  "#f783ac",
  "#c0c8d4",
];

export const colorFor = (community: number) =>
  GRAPH_COLORS[community % GRAPH_COLORS.length];

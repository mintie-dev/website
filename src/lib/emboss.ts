// Embossed paper backgrounds: a pattern pressed into the same paper as the page, lit from the
// top-left so it reads as tiny bumps, plus a fine grain. Built as an SVG tile for CSS.

const W = 240, H = 240;
const S = 'fill="none" stroke="#000" stroke-linecap="round"';

// the curvy diamond ("ogee") lattice the lattice patterns share
const ogee = (w = 3) => [0, 120, 240].map((x) => `
  <path d="M${x} 0 C${x - 54} 30 ${x - 54} 90 ${x} 120 C${x + 54} 150 ${x + 54} 210 ${x} 240" ${S} stroke-width="${w}" />
  <path d="M${x} 0 C${x + 54} 30 ${x + 54} 90 ${x} 120 C${x - 54} 150 ${x - 54} 210 ${x} 240" ${S} stroke-width="${w}" />`).join('');
const CELLS = [[60, 120], [180, 120], [60, 0], [180, 0], [60, 240], [180, 240]];
const CROSSINGS = [[0, 60], [120, 60], [240, 60], [0, 180], [120, 180], [240, 180]];
const flower = (x: number, y: number, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    ${[0, 90, 180, 270].map((a) => `<ellipse cx="0" cy="-10" rx="6" ry="10" transform="rotate(${a})" />`).join('')}
    ${[45, 135, 225, 315].map((a) => `<ellipse cx="0" cy="-15" rx="2.6" ry="5" transform="rotate(${a})" />`).join('')}
  </g>`;
const bow = (x: number, y: number, s = 2.6, r = 0) => `
  <g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
    <path d="M-2 -0.3 C-4 -7 -11 -7 -10.2 -0.8 C-9.6 4.6 -4.4 4.9 -2 0.8 Z" />
    <path d="M2 -0.3 C4 -7 11 -7 10.2 -0.8 C9.6 4.6 4.4 4.9 2 0.8 Z" />
    <circle r="3.2" />
  </g>`;
const leafPair = (x: number, y: number) => `
  <ellipse cx="${x - 9}" cy="${y}" rx="9" ry="3.6" transform="rotate(-30 ${x - 9} ${y})" />
  <ellipse cx="${x + 9}" cy="${y}" rx="9" ry="3.6" transform="rotate(30 ${x + 9} ${y})" />`;

const PATTERNS: Record<string, { name: string; draw: string }> = {
  lattice: {
    name: 'Lattice',
    draw: ogee() + CELLS.map(([x, y]) => flower(x, y)).join('') + CROSSINGS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" />`).join(''),
  },
  latticeBows: {
    name: 'Lattice + bows',
    draw: ogee() + CELLS.map(([x, y], i) => bow(x, y, 2.4, i % 2 ? 8 : -8)).join('') + CROSSINGS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" />`).join(''),
  },
  latticeLeaves: {
    name: 'Lattice + leaves',
    draw: ogee(2.5) + CELLS.map(([x, y]) => flower(x, y, 0.8)).join('') + CROSSINGS.map(([x, y]) => leafPair(x, y)).join(''),
  },
  trellis: {
    name: 'Trellis',
    // straight diamond grid with little flowers where the lines cross
    draw: [-240, -120, 0, 120, 240].map((o) => `
      <path d="M${o} 0 L${o + 240} 240" ${S} stroke-width="2.5" />
      <path d="M${o + 240} 0 L${o} 240" ${S} stroke-width="2.5" />`).join('') +
      [[0, 0], [120, 0], [240, 0], [60, 60], [180, 60], [0, 120], [120, 120], [240, 120], [60, 180], [180, 180], [0, 240], [120, 240], [240, 240]]
        .map(([x, y], i) => (i % 2 ? `<circle cx="${x}" cy="${y}" r="4.5" />` : flower(x, y, 0.75))).join(''),
  },
  quatrefoil: {
    name: 'Quatrefoil',
    // interlocking four-leaf shapes, like a tiled ceiling
    draw: [[60, 60], [180, 60], [60, 180], [180, 180]]
      .map(([x, y]) => `<g transform="translate(${x} ${y})">${[[0, -20], [20, 0], [0, 20], [-20, 0]].map(([dx, dy]) => `<circle cx="${dx}" cy="${dy}" r="21" ${S} stroke-width="2.5" />`).join('')}<circle r="4" /></g>`).join(''),
  },
  scallop: {
    name: 'Scallops',
    // overlapping fish-scale arcs
    draw: Array.from({ length: 10 }, (_, row) => Array.from({ length: 6 }, (_, col) => {
      const x = col * 48 - (row % 2 ? 24 : 0), y = row * 24;
      return `<path d="M${x} ${y} A24 24 0 0 0 ${x + 48} ${y}" ${S} stroke-width="2.5" />`;
    }).join('')).join(''),
  },
};

export const EMBOSS_PATTERNS = Object.entries(PATTERNS).map(([id, p]) => ({ id, name: p.name }));
export const EMBOSS_LOOKS = [
  { id: 'soft', name: 'Soft' },
  { id: 'crisp', name: 'Crisp' },
  { id: 'shadow', name: 'Pressed in' },
  { id: 'tinted', name: 'Tinted' },
];

// `base`: background colour. `depth`: how strongly it's pressed. `look`:
//   soft   – gentle highlight and shadow (the original)
//   crisp  – sharper edges, more contrast
//   shadow – only the shadow side, so it looks pressed into the paper
//   tinted – soft emboss plus a faint darker tint inside the pattern, so it shows from further away
export function embossed(id: string, base: string, depth = 2.6, look = 'soft') {
  const p = PATTERNS[id];
  // repeat the motif around the tile so it wraps without seams
  const tiled = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => `<g transform="translate(${dx * W} ${dy * H})">${p.draw}</g>`)).join('');
  const blur = look === 'crisp' ? 0.8 : look === 'shadow' ? 1.1 : 1.6;
  const scale = look === 'crisp' ? depth * 1.5 : depth;
  const grain = `
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" stitchTiles="stitch" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.06 0" result="g"/>`;
  const light = (k: number, az = 225) => `
    <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="b"/>
    <feDiffuseLighting in="b" surfaceScale="${scale}" diffuseConstant="${k}" lighting-color="#fff" result="l">
      <feDistantLight azimuth="${az}" elevation="55"/>
    </feDiffuseLighting>`;
  let body: string;
  if (look === 'shadow') {
    // flat paper lights to exactly white, so multiplying only darkens the shadowed edges
    body = `${light(1.22, 45)}
      <feComponentTransfer in="l" result="l2">
        <feFuncR type="linear" slope="0.22" intercept="0.78"/><feFuncG type="linear" slope="0.22" intercept="0.78"/><feFuncB type="linear" slope="0.22" intercept="0.78"/>
      </feComponentTransfer>
      ${grain}<feComposite in="g" in2="l2" operator="over" result="lg"/>
      <feFlood flood-color="${base}" result="c"/><feBlend in="lg" in2="c" mode="multiply"/>`;
  } else {
    body = `${light(0.61)}${grain}<feComposite in="g" in2="l" operator="over" result="lg"/>
      <feFlood flood-color="${base}" result="c"/><feBlend in="lg" in2="c" mode="soft-light" result="e"/>`;
    if (look === 'tinted') {
      body += `<feFlood flood-color="#7a6a5a" flood-opacity="${Math.min(0.12, 0.025 * depth)}" result="t"/>
        <feComposite in="t" in2="SourceAlpha" operator="in" result="ts"/>
        <feMerge><feMergeNode in="e"/><feMergeNode in="ts"/></feMerge>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <filter id="e" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${body}</filter>
    <g filter="url(#e)">${tiled}</g>
  </svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
}

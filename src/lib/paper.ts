// The old, torn-edged letter paper shared by /writealetter and /openmymailbox.

// A mask with small random nicks along the edges, for a sheet `pages` A4 pages tall.
export function deckleMask(pages = 1) {
  let seed = 11;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const H = 297 * pages;
  const pts: string[] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) => {
    const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 1.6);
    for (let i = 0; i < n; i++) {
      const t = i / n, j = rnd() * 1.4 * (rnd() < 0.15 ? 1.8 : 1);
      pts.push(`${(x0 + (x1 - x0) * t + nx * j).toFixed(2)},${(y0 + (y1 - y0) * t + ny * j).toFixed(2)}`);
    }
  };
  edge(0, 0, 210, 0, 0, 1);
  edge(210, 0, 210, H, -1, 0);
  edge(210, H, 0, H, 0, -1);
  edge(0, H, 0, 0, 1, 0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 ${H}" preserveAspectRatio="none"><polygon points="${pts.join(' ')}"/></svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
}

// Size a sheet to whole A4 pages around its content, like Google Docs adding a page when the
// last one fills up. Returns the number of pages.
export function fitPaper(paper: HTMLElement, content: HTMLElement) {
  const pageH = (paper.offsetWidth * 297) / 210;
  const cs = getComputedStyle(paper);
  const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  content.style.minHeight = '';
  const pages = Math.max(1, Math.ceil((content.scrollHeight + pad + 2) / pageH));
  paper.style.setProperty('--page-h', `${pageH}px`);
  paper.style.height = `${pages * pageH}px`;
  content.style.minHeight = `${pages * pageH - pad}px`;
  if (paper.dataset.pages !== String(pages)) {
    paper.dataset.pages = String(pages);
    paper.style.setProperty('--deckle', deckleMask(pages));
  }
  return pages;
}

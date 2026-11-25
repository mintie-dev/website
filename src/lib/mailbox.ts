// Shared bits for the letter pages (/writealetter, /openmymailbox) and the homepage envelope.

// Where the mailbox API (mailbox/ folder, a Cloudflare Worker) lives.
export const API: string =
  import.meta.env.PUBLIC_MAILBOX_API ?? (import.meta.env.DEV ? 'http://localhost:8787' : 'https://mailbox.lemaithi.com');

export const FONTS = [
  // the site's own font (SF Pro on Apple devices, the system font elsewhere)
  { id: 'sf', label: 'SF Pro', css: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif' },
  { id: 'times', label: 'Times New Roman', css: '"Times New Roman", Times, serif' },
  { id: 'courier', label: 'Courier New', css: '"Courier New", Courier, monospace' },
] as const;

export const SIZES = [10, 12, 14] as const; // pt

export type Letter = { id: string; html: string; text: string; created_at: number; archived_at: number | null };

export async function api(path: string, init: RequestInit & { token?: string | null } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  const res = await fetch(API + path, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

export async function getStatus(): Promise<{ count: number; capacity: number } | null> {
  try {
    const r = await api('/status');
    return r.ok ? r.data : null;
  } catch {
    return null;
  }
}

// --- Letter HTML clean-up -------------------------------------------------------------
// Letters are written in a contenteditable, so they arrive as HTML. Before showing one (or
// sending one) keep only the formatting the editor can make: no scripts, links, images or
// arbitrary styles can survive this.

const KEEP = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'SPAN', 'FONT', 'DIV', 'P', 'BR', 'UL', 'OL', 'LI']);
const DROP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'TITLE', 'HEAD']);
const COLOR = /^(rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(,\s*[\d.]+\s*)?\)|#[0-9a-f]{3,8}|transparent)$/i;

export function fontIdOf(family: string) {
  if (/times|serif/i.test(family) && !/sans-serif/i.test(family)) return 'times';
  if (/mono|menlo|courier|consolas/i.test(family)) return 'courier';
  return 'sf';
}

function cleanStyle(from: HTMLElement, to: HTMLElement) {
  const s = from.style;
  if (/^(bold|[6-9]00)$/.test(s.fontWeight)) to.style.fontWeight = 'bold';
  if (s.fontStyle === 'italic') to.style.fontStyle = 'italic';
  if (/underline/.test(s.textDecorationLine || s.textDecoration)) to.style.textDecoration = 'underline';
  const color = s.color || from.getAttribute('color') || '';
  if (COLOR.test(color)) to.style.color = color;
  if (COLOR.test(s.backgroundColor)) to.style.backgroundColor = s.backgroundColor;
  const family = s.fontFamily || from.getAttribute('face') || '';
  if (family) to.style.fontFamily = FONTS.find((f) => f.id === fontIdOf(family))!.css;
  const size = parseFloat(s.fontSize);
  if (/pt$/.test(s.fontSize) && (SIZES as readonly number[]).includes(size)) to.style.fontSize = `${size}pt`;
}

export function cleanLetter(html: string): DocumentFragment {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out = document.createDocumentFragment();
  const copy = (src: Node, dst: Node) => {
    for (const n of Array.from(src.childNodes)) {
      if (n.nodeType === Node.TEXT_NODE) {
        dst.appendChild(document.createTextNode(n.textContent ?? ''));
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as HTMLElement;
        if (DROP.has(el.tagName)) continue;
        if (!KEEP.has(el.tagName)) { copy(el, dst); continue; } // unwrap, keep the text
        const c = document.createElement(el.tagName === 'FONT' ? 'span' : el.tagName.toLowerCase());
        cleanStyle(el, c);
        copy(el, c);
        dst.appendChild(c);
      }
    }
  };
  copy(doc.body, out);
  return out;
}

export function cleanLetterHTML(html: string) {
  const div = document.createElement('div');
  div.appendChild(cleanLetter(html));
  return div.innerHTML;
}

// --- Text helpers ---------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// Apple-Notes style: the first line is the title, the rest is the little note under it.
export function titleAndNote(text: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let title = lines[0] ?? 'Untitled';
  if (title.length > 60) title = title.slice(0, 60).replace(/\s+\S*$/, '') + '…';
  const note = lines.slice(1).join(' ');
  return { title, note };
}

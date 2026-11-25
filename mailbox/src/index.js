// Thi's mailbox: a tiny API that stores letters written on lemaithi.com/writealetter.
//
// Public:   GET  /status                 -> { count, capacity }   (letters waiting in the mailbox)
//           POST /letters  {html, text}  -> 201 | 409 when the mailbox is full
// Private:  POST /login    {password}    -> { token }   (send it back as "Authorization: Bearer <token>")
//           GET  /letters                -> every letter, mailbox and box
//           POST /letters/:id/archive    -> move one letter into the box (frees a mailbox slot)
//           POST /archive-all            -> move every mailbox letter into the box
//           DELETE /letters/:id          -> delete a letter for good
//
// Secrets: PASSWORD (set with `wrangler secret put PASSWORD`). Changing it signs out every device.

const CAPACITY = 10;
const SESSION_DAYS = 180;
const MAX_HTML = 200_000;
const MAX_TEXT = 50_000;
const LOGIN_TRIES_PER_HOUR = 10;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());
    const cors = allowed.includes(origin)
      ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
      : {};

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      const res = await route(request, env);
      for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
      return res;
    } catch (err) {
      console.error(err);
      return json({ error: 'server error' }, 500, cors);
    }
  },
};

async function route(request, env) {
  const { pathname } = new URL(request.url);
  const m = request.method;

  if (m === 'GET' && pathname === '/status') {
    return json({ count: await mailboxCount(env), capacity: CAPACITY });
  }

  if (m === 'POST' && pathname === '/letters') {
    const body = await readJson(request);
    const html = typeof body?.html === 'string' ? body.html : '';
    const text = typeof body?.text === 'string' ? body.text : '';
    if (!text.trim()) return json({ error: 'empty letter' }, 400);
    if (html.length > MAX_HTML || text.length > MAX_TEXT) return json({ error: 'letter too long' }, 413);
    // Check and insert in one statement so two letters can't both take the last slot.
    const id = crypto.randomUUID();
    const result = await env.DB.prepare(
      `INSERT INTO letters (id, html, text, created_at)
       SELECT ?1, ?2, ?3, ?4 WHERE (SELECT COUNT(*) FROM letters WHERE archived_at IS NULL) < ?5`,
    ).bind(id, html, text, Date.now(), CAPACITY).run();
    if (!result.meta.changes) return json({ error: 'mailbox full', count: CAPACITY, capacity: CAPACITY }, 409);
    return json({ ok: true, count: await mailboxCount(env), capacity: CAPACITY }, 201);
  }

  if (m === 'POST' && pathname === '/login') {
    const ip = request.headers.get('CF-Connecting-IP') || 'local';
    const hour = Math.floor(Date.now() / 3_600_000);
    const key = `${ip}:${hour}`;
    const row = await env.DB.prepare('SELECT tries FROM login_tries WHERE key = ?1').bind(key).first();
    if (row && row.tries >= LOGIN_TRIES_PER_HOUR) return json({ error: 'too many tries, wait an hour' }, 429);

    const body = await readJson(request);
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!env.PASSWORD || !(await sameString(password, env.PASSWORD))) {
      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO login_tries (key, tries) VALUES (?1, 1)
           ON CONFLICT(key) DO UPDATE SET tries = tries + 1`,
        ).bind(key),
        env.DB.prepare('DELETE FROM login_tries WHERE key NOT LIKE ?1').bind(`%:${hour}`),
      ]);
      return json({ error: 'wrong password' }, 401);
    }
    const exp = Date.now() + SESSION_DAYS * 86_400_000;
    return json({ token: `${exp}.${await sign(env.PASSWORD, String(exp))}` });
  }

  // Everything below is Thi only.
  if (!(await authorised(request, env))) return json({ error: 'locked' }, 401);

  if (m === 'GET' && pathname === '/letters') {
    const { results } = await env.DB.prepare(
      'SELECT id, html, text, created_at, archived_at FROM letters ORDER BY created_at DESC',
    ).all();
    return json({ letters: results, capacity: CAPACITY });
  }

  if (m === 'POST' && pathname === '/archive-all') {
    await env.DB.prepare('UPDATE letters SET archived_at = ?1 WHERE archived_at IS NULL').bind(Date.now()).run();
    return json({ ok: true });
  }

  const one = pathname.match(/^\/letters\/([0-9a-f-]{36})(\/archive)?$/);
  if (one && m === 'POST' && one[2]) {
    await env.DB.prepare('UPDATE letters SET archived_at = ?1 WHERE id = ?2 AND archived_at IS NULL')
      .bind(Date.now(), one[1]).run();
    return json({ ok: true });
  }
  if (one && m === 'DELETE' && !one[2]) {
    await env.DB.prepare('DELETE FROM letters WHERE id = ?1').bind(one[1]).run();
    return json({ ok: true });
  }

  return json({ error: 'not found' }, 404);
}

async function mailboxCount(env) {
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM letters WHERE archived_at IS NULL').first();
  return row.n;
}

async function authorised(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const [exp, sig] = token.split('.');
  if (!env.PASSWORD || !exp || !sig || !(Number(exp) > Date.now())) return false;
  return sameString(sig, await sign(env.PASSWORD, exp));
}

async function sign(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('session:' + message));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Compare by hashing both sides first so the time taken doesn't leak how much matched.
async function sameString(a, b) {
  const h = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [x, y] = await Promise.all([h(a), h(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });
}

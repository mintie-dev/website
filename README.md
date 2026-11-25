# lemaithi.com

Personal site. Astro, plain Markdown, no design.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # fails if a project uses an unknown tag
```

**Add a project:** copy any file in `src/content/projects/`, rename it (the filename becomes the URL),
edit the frontmatter. Allowed values for `fields`, `topics` and `status` are in `src/content.config.ts`.
Projects with `status: ongoing` show up under "Now" on the home page.

**Add a note:** new `.md` in `src/content/notes/` with `title`, `date`, `summary`. Set `draft: true` to hide it.

**Images:** put them in `public/images/` and use `![alt](/images/foo.jpg)`.

Pushing to `main` deploys via `.github/workflows/deploy.yml`.

**Mailbox** (`/writealetter`, `/openmymailbox`): letters are stored by a small Cloudflare Worker in
`mailbox/` (D1 database, holds 10 letters waiting at a time). It deploys separately from the site:

```bash
cd mailbox
npm run dev                          # local API on :8787 (local password lives in mailbox/.dev.vars)
npm run deploy                       # publish the Worker
npx wrangler secret put PASSWORD     # change the mailbox password (signs out every device)
```

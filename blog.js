// Blog listing — dynamically loads all .md files from the GitHub repo
// No index.json required. Uses GitHub Contents API (public, no token needed).
(async function initBlogPage() {

  const OWNER  = 'shahil-sk';
  const REPO   = 'shahil-sk.github.io';
  const BRANCH = 'main';
  const API    = `https://api.github.com/repos/${OWNER}/${REPO}/contents/posts?ref=${BRANCH}`;

  const grid      = document.getElementById('blog-posts-grid');
  const filtersEl = document.getElementById('blog-filters');
  if (!grid) return;

  let allPosts  = [];
  let activeTag = 'all';

  // ── 1. List all files in /posts via GitHub API ──────────────────────────────
  grid.innerHTML = '<div class="blog-loading">Loading posts...</div>';

  let mdFiles = [];
  try {
    const res  = await fetch(API);
    if (!res.ok) throw new Error('API ' + res.status);
    const dir  = await res.json();
    mdFiles    = dir.filter(f => f.type === 'file' && f.name.endsWith('.md'));
  } catch (e) {
    // Fallback: try index.json (offline / API rate-limited)
    try {
      const r = await fetch('posts/index.json?' + Date.now());
      if (!r.ok) throw new Error();
      allPosts = await r.json();
      buildUI();
      return;
    } catch {
      grid.innerHTML = '<div class="blog-empty">No posts yet. Check back soon.</div>';
      return;
    }
  }

  if (!mdFiles.length) {
    grid.innerHTML = '<div class="blog-empty">No posts yet. Check back soon.</div>';
    return;
  }

  // ── 2. Fetch each .md and parse frontmatter in parallel ─────────────────────
  const results = await Promise.allSettled(
    mdFiles.map(async (file) => {
      // Use the raw GitHub URL — faster than another API call
      const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/posts/${file.name}`;
      const r      = await fetch(rawUrl);
      if (!r.ok) throw new Error('Could not fetch ' + file.name);
      const text   = await r.text();
      const slug   = file.name.replace(/\.md$/, '');
      const { frontmatter } = parseFrontmatter(text);
      return {
        slug,
        title:   frontmatter.title   || slug,
        date:    frontmatter.date    || '',
        excerpt: frontmatter.excerpt || '',
        tags:    frontmatter.tags    || []
      };
    })
  );

  allPosts = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0)); // newest first

  if (!allPosts.length) {
    grid.innerHTML = '<div class="blog-empty">No posts yet. Check back soon.</div>';
    return;
  }

  buildUI();

  // ── 3. Build filters + grid ─────────────────────────────────────────────────
  function buildUI() {
    // Tag filter buttons
    const allTags = new Set();
    allPosts.forEach(p => (p.tags || []).forEach(t => allTags.add(t)));
    allTags.forEach(tag => {
      const btn       = document.createElement('button');
      btn.className   = 'filter-btn';
      btn.dataset.tag = tag;
      btn.textContent = tag.toUpperCase();
      filtersEl.appendChild(btn);
    });

    filtersEl.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      activeTag = btn.dataset.tag;
      filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPosts();
    });

    renderPosts();
  }

  function renderPosts() {
    const filtered = activeTag === 'all'
      ? allPosts
      : allPosts.filter(p => (p.tags || []).includes(activeTag));

    if (!filtered.length) {
      grid.innerHTML = '<div class="blog-empty">No posts in this category.</div>';
      return;
    }

    grid.innerHTML = filtered.map((post, i) => `
      <a href="blog-post.html?post=${post.slug}" class="blog-card" style="transition-delay:${(i % 3) * 0.08}s">
        <span class="blog-card-date">${post.date}</span>
        <span class="blog-card-title">${htmlEsc(post.title)}</span>
        <span class="blog-card-excerpt">${htmlEsc(post.excerpt)}</span>
        <div class="blog-card-tags">${(post.tags || []).map(t => `<span class="blog-tag">${htmlEsc(t)}</span>`).join('')}</div>
        <span class="blog-card-arrow">READ →</span>
      </a>
    `).join('');

    setTimeout(() => {
      grid.querySelectorAll('.blog-card').forEach(el => observer.observe(el));
    }, 50);
  }

  const observer = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.05 }
  );

  // ── Frontmatter parser (CRLF-safe) ──────────────────────────────────────────
  function parseFrontmatter(raw) {
    const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    if (!text.startsWith('---')) return { frontmatter: {}, body: text };
    const closeIdx = text.indexOf('\n---', 3);
    if (closeIdx === -1) return { frontmatter: {}, body: text };
    const fmBlock = text.slice(3, closeIdx).trim();
    const body    = text.slice(closeIdx + 4).replace(/^\n+/, '');
    const fm      = {};
    let curKey    = null;
    const tagLines = [];
    fmBlock.split('\n').forEach(line => {
      if (curKey === 'tags' && /^\s+-\s+/.test(line)) {
        tagLines.push(line.replace(/^\s+-\s+/, '').trim());
        return;
      }
      const kv = line.match(/^([\w-]+):\s*(.*)$/);
      if (kv) { curKey = kv[1]; fm[kv[1]] = kv[2].trim(); }
    });
    if (tagLines.length) fm.tags = tagLines;
    else if (fm.tags)    fm.tags = fm.tags.split(',').map(t => t.trim()).filter(Boolean);
    else                 fm.tags = [];
    return { frontmatter: fm, body };
  }

  function htmlEsc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

})();

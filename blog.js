// Blog listing — optimized to use pre-built index.json
// Fallback to GitHub API if index is missing
(async function initBlogPage() {

  const OWNER  = 'shahil-sk';
  const REPO   = 'shahil-sk.github.io';
  const BRANCH = 'main';
  const INDEX_URL = 'posts/index.json';
  const API_URL   = `https://api.github.com/repos/${OWNER}/${REPO}/contents/posts?ref=${BRANCH}`;

  const grid      = document.getElementById('blog-posts-grid');
  const filtersEl = document.getElementById('blog-filters');
  if (!grid) return;

  let allPosts  = [];
  let activeTag = 'all';

  grid.innerHTML = '<div class=\"blog-loading\">Loading posts...</div>';

  // ── 1. Try loading pre-built index first (FAST) ─────────────────────────────
  try {
    const r = await fetch(INDEX_URL + '?' + Date.now());
    if (!r.ok) throw new Error('Index not found');
    allPosts = await r.json();
    console.log('Loaded from index.json');
    buildUI();
  } catch (e) {
    console.warn('Index load failed, falling back to API:', e);
    await loadFromAPI();
  }

  // ── 2. Fallback: Scan GitHub API (SLOW) ─────────────────────────────────────
  async function loadFromAPI() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('API ' + res.status);
      const dir = await res.json();
      const mdFiles = dir.filter(f => f.type === 'file' && f.name.endsWith('.md'));

      if (!mdFiles.length) {
        grid.innerHTML = '<div class=\"blog-empty\">No posts yet. Check back soon.</div>';
        return;
      }

      // Fetch each .md and parse frontmatter in parallel
      const results = await Promise.allSettled(
        mdFiles.map(async (file) => {
          const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/posts/${file.name}`;
          const r      = await fetch(rawUrl);
          if (!r.ok) throw new Error('Could not fetch ' + file.name);
          const text   = await r.text();
          const slug   = file.name.replace(/\.md$/, '');
          const { frontmatter } = parseFrontmatter(text);
          // Fallback to JS viewer if static page doesn't exist
          return {
            slug,
            title:   frontmatter.title   || slug,
            date:    frontmatter.date    || '',
            excerpt: frontmatter.excerpt || '',
            tags:    frontmatter.tags    || [],
            url:     `posts/${slug}.html`
          };
        })
      );

      allPosts = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

      buildUI();
    } catch (err) {
      console.error(err);
      grid.innerHTML = '<div class=\"blog-empty\">Unable to load posts.</div>';
    }
  }

  // ── 3. Build UI ─────────────────────────────────────────────────────────────
  function buildUI() {
    if (!allPosts.length) {
      grid.innerHTML = '<div class=\"blog-empty\">No posts found.</div>';
      return;
    }

    // Tag filter buttons
    const allTags = new Set();
    allPosts.forEach(p => (p.tags || []).forEach(t => allTags.add(t)));
    
    // Clear existing filters first
    if (filtersEl) {
      filtersEl.innerHTML = '<button class=\"filter-btn active\" data-tag=\"all\">ALL</button>';
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
    }

    renderPosts();
  }

  function renderPosts() {
    const filtered = activeTag === 'all'
      ? allPosts
      : allPosts.filter(p => (p.tags || []).includes(activeTag));

    if (!filtered.length) {
      grid.innerHTML = '<div class=\"blog-empty\">No posts in this category.</div>';
      return;
    }

    grid.innerHTML = filtered.map((post, i) => {
        // PREFER STATIC HTML: If post.url is set (from index.json), use it.
        // If not (API fallback), construct standard static path.
        // We avoid blog-post.html?post=slug entirely now.
        const postUrl = post.url || `posts/${post.slug}.html`;
        
        return `
      <a href=\"${postUrl}\" class=\"blog-card\" style=\"transition-delay:${(i % 3) * 0.08}s\">
        <span class=\"blog-card-date\">${post.date}</span>
        <span class=\"blog-card-title\">${htmlEsc(post.title)}</span>
        <span class=\"blog-card-excerpt\">${htmlEsc(post.excerpt)}</span>
        <div class=\"blog-card-tags\">${(post.tags || []).map(t => `<span class=\"blog-tag\">${htmlEsc(t)}</span>`).join('')}</div>
        <span class=\"blog-card-arrow\">READ →</span>
      </a>
    `}).join('');
    
    // Trigger animations
    setTimeout(() => {
      const observer = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
        { threshold: 0.05 }
      );
      grid.querySelectorAll('.blog-card').forEach(el => observer.observe(el));
    }, 50);
  }

  // ── Helper: Frontmatter parser (CRLF-safe) ──────────────────────────────────
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

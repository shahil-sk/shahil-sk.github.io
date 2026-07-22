// Blog listing — optimized to use pre-built index.json
// Fallback to GitHub API if index is missing
(async function initBlogPage() {

  const OWNER  = 'shahil-sk';
  const REPO   = 'shahil-sk.github.io';
  const BRANCH = 'main';
  const INDEX_URL = 'posts/index.json';
  const API_URL   = `https://api.github.com/repos/${OWNER}/${REPO}/contents/blog/content?ref=${BRANCH}`;

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
          const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/blog/content/${file.name}`;
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

  // --- Terminal Integration Helper ---
  function simulateTerminalCommand(command, callback) {
      const input = document.getElementById('terminal-input');
      const fakeText = document.getElementById('fake-input-text');
      if (!input || !fakeText) { callback(); return; }
      
      input.value = '';
      fakeText.textContent = '';
      let i = 0;
      
      const typeInterval = setInterval(() => {
          if (i < command.length) {
              input.value += command[i];
              fakeText.textContent += command[i];
              i++;
          } else {
              clearInterval(typeInterval);
              setTimeout(() => {
                  const e = new KeyboardEvent('keydown', { key: 'Enter' });
                  input.dispatchEvent(e);
                  setTimeout(callback, 600);
              }, 200);
          }
      }, 40);
  }

  // ── 3. Build UI ─────────────────────────────────────────────────────────────
  function buildUI() {
    if (!allPosts.length) {
      grid.innerHTML = '<div class=\"text-micro text-ink/50\">No posts found.</div>';
      return;
    }

    // Tag filter buttons
    const allTags = new Set();
    allPosts.forEach(p => (p.tags || []).forEach(t => allTags.add(t)));
    
    // Clear existing filters first
    if (filtersEl) {
      filtersEl.innerHTML = '<button class=\"filter-btn active text-micro text-accent transition-colors\" data-tag=\"all\">[ ALL ]</button>';
      allTags.forEach(tag => {
        const btn       = document.createElement('button');
        btn.className   = 'filter-btn text-micro text-ink/50 hover:text-accent transition-colors';
        btn.dataset.tag = tag;
        btn.textContent = `[ ${tag.toUpperCase()} ]`;
        filtersEl.appendChild(btn);
      });

      filtersEl.addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn || btn.classList.contains('active')) return;
        
        const tag = btn.dataset.tag;
        const cmd = tag === 'all' ? 'ls -la ./transmissions/' : `grep -R "${tag}" ./transmissions/`;
        
        const toggle = document.getElementById('terminal-toggle');
        const navTerminal = document.getElementById('nav-terminal');
        
        if (navTerminal && navTerminal.classList.contains('hidden')) {
            toggle.click();
        }
        
        simulateTerminalCommand(cmd, () => {
            activeTag = tag;
            filtersEl.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'text-accent');
                b.classList.add('text-ink/50', 'hover:text-accent');
            });
            btn.classList.add('active', 'text-accent');
            btn.classList.remove('text-ink/50', 'hover:text-accent');
            renderPosts();
            
            setTimeout(() => {
                if (navTerminal && !navTerminal.classList.contains('hidden')) {
                    toggle.click(); // close terminal
                }
            }, 800);
        });
      });
    }

    renderPosts();
  }

  function renderPosts() {
    const filtered = activeTag === 'all'
      ? allPosts
      : allPosts.filter(p => (p.tags || []).includes(activeTag));

    if (!filtered.length) {
      grid.innerHTML = '<div class=\"text-micro text-ink/50\">No posts in this category.</div>';
      return;
    }

    grid.innerHTML = filtered.map((post, i) => {
        const postUrl = post.url || `posts/${post.slug}.html`;
        const num = (i + 1).toString().padStart(2, '0');
        
        return `
      <a href=\"${postUrl}\" data-command="cat ${post.slug}.log" class=\"blog-card group flex flex-col md:flex-row gap-6 md:gap-16 items-start opacity-0 translate-y-4 transition-all duration-700 ease-out w-full border-b border-ink/10 pb-12 mb-12 last:border-0\" style=\"transition-delay:${(i % 3) * 0.08}s\">
        <span class=\"text-macro text-6xl md:text-8xl text-ink/20 group-hover:text-accent transition-colors duration-500 pointer-events-none\">${num}</span>
        <div class="flex flex-col gap-6 pt-2 w-full pointer-events-none">
            <h3 class=\"text-macro text-4xl md:text-6xl text-ink leading-[0.85] uppercase group-hover:text-accent transition-colors\">${htmlEsc(post.title)}</h3>
            <p class="text-micro text-ink/60 max-w-2xl leading-relaxed group-hover:text-ink transition-colors duration-300 opacity-80">${htmlEsc(post.excerpt)}</p>
            <div class=\"flex gap-4 items-center pt-4 w-full\">
                <span class=\"text-micro text-ink/40 shrink-0\">${post.date}</span>
                <span class=\"text-micro text-ink/20\">//</span>
                <div class=\"flex gap-2 flex-wrap\">
                    ${(post.tags || []).map(t => `<span class=\"text-micro text-ink/60 uppercase\">${htmlEsc(t)}</span>`).join('<span class="text-ink/20">/</span>')}
                </div>
            </div>
        </div>
      </a>
    `}).join('');
    
    // Intercept clicks on posts
    grid.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const url = card.getAttribute('href');
            const cmd = card.getAttribute('data-command');
            
            const toggle = document.getElementById('terminal-toggle');
            const navTerminal = document.getElementById('nav-terminal');
            
            if (navTerminal && navTerminal.classList.contains('hidden')) {
                toggle.click();
            }
            
            simulateTerminalCommand(cmd, () => {
                window.location.href = url;
            });
        });
    });

    // Trigger animations
    setTimeout(() => {
      const observer = new IntersectionObserver(
        entries => entries.forEach(e => { 
          if (e.isIntersecting) {
            e.target.classList.remove('opacity-0', 'translate-y-4');
            e.target.classList.add('opacity-100', 'translate-y-0');
          } 
        }),
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

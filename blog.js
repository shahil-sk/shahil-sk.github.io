// Blog listing page logic
(async function initBlogPage() {
  const grid = document.getElementById('blog-posts-grid');
  const filtersEl = document.getElementById('blog-filters');
  if (!grid) return;

  let allPosts = [];
  let activeTag = 'all';

  try {
    const res = await fetch('posts/index.json');
    if (!res.ok) throw new Error('No posts found');
    allPosts = await res.json();
  } catch (e) {
    grid.innerHTML = '<div class="blog-empty">No posts yet. Check back soon.</div>';
    return;
  }

  // Build tag filters
  const allTags = new Set();
  allPosts.forEach(p => (p.tags || []).forEach(t => allTags.add(t)));
  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.tag = tag;
    btn.textContent = tag.toUpperCase();
    filtersEl.appendChild(btn);
  });

  // Filter logic
  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    activeTag = btn.dataset.tag;
    filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPosts();
  });

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
        <span class="blog-card-title">${post.title}</span>
        <span class="blog-card-excerpt">${post.excerpt || ''}</span>
        <div class="blog-card-tags">${(post.tags || []).map(t => `<span class="blog-tag">${t}</span>`).join('')}</div>
        <span class="blog-card-arrow">READ →</span>
      </a>
    `).join('');

    // trigger reveal
    setTimeout(() => {
      grid.querySelectorAll('.blog-card').forEach(el => {
        observer.observe(el);
      });
    }, 50);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.05 });

  renderPosts();
})();
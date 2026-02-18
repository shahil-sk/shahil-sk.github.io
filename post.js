// Individual post reader
(async function initPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('post');

  if (!slug) {
    window.location.href = 'blog.html';
    return;
  }

  // Update page title while loading
  document.title = 'Loading... — Shahil Ahmed';

  try {
    // Fetch the markdown file
    const mdRes = await fetch(`posts/${slug}.md`);
    if (!mdRes.ok) throw new Error('Post not found');
    const raw = await mdRes.text();

    // Parse frontmatter (--- ... ---) and body
    const { frontmatter, body } = parseFrontmatter(raw);

    // Set meta
    document.title = (frontmatter.title || slug) + ' — Shahil Ahmed';

    const titleEl = document.getElementById('post-title');
    const metaEl  = document.getElementById('post-meta');
    const tagsEl  = document.getElementById('post-tags');
    const bodyEl  = document.getElementById('post-body');
    const readEl  = document.getElementById('post-reading-time');

    if (titleEl) titleEl.textContent = frontmatter.title || slug;

    if (metaEl) {
      metaEl.innerHTML = `
        <span>${frontmatter.date || ''}</span>
        ${frontmatter.author ? `<span>by ${frontmatter.author}</span>` : ''}
      `;
    }

    if (tagsEl && frontmatter.tags) {
      const tags = Array.isArray(frontmatter.tags)
        ? frontmatter.tags
        : frontmatter.tags.split(',').map(t => t.trim());
      tagsEl.innerHTML = tags.map(t => `<span class="blog-tag">${t}</span>`).join('');
    }

    // Reading time estimate
    const words = body.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    if (readEl) readEl.textContent = `${mins} min read  •  ${words} words`;

    // Render markdown
    if (bodyEl && typeof marked !== 'undefined') {
      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      // Custom renderer for images — resolve relative paths
      const renderer = new marked.Renderer();
      renderer.image = function(href, title, text) {
        // If it's a relative path (not http/https), prepend posts/images/ path
        let src = href;
        if (src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
          src = `posts/images/${src}`;
        }
        const titleAttr = title ? ` title="${title}"` : '';
        return `<figure><img src="${src}" alt="${text || ''}"${titleAttr} loading="lazy"><figcaption>${text || ''}</figcaption></figure>`;
      };

      bodyEl.innerHTML = marked.parse(body, { renderer });

      // Syntax highlighting
      if (typeof hljs !== 'undefined') {
        bodyEl.querySelectorAll('pre code').forEach(block => {
          hljs.highlightElement(block);
        });
      }
    } else if (bodyEl) {
      bodyEl.textContent = body;
    }

  } catch (err) {
    document.getElementById('post-title').textContent = '404 — Post not found';
    document.getElementById('post-body').innerHTML =
      '<p>This post could not be loaded. <a href="blog.html">Go back to blog.</a></p>';
  }

  function parseFrontmatter(raw) {
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!fmMatch) return { frontmatter: {}, body: raw };

    const fmLines = fmMatch[1].split('\n');
    const frontmatter = {};
    let currentKey = null;
    const tagLines = [];

    for (const line of fmLines) {
      // tags as YAML list
      if (currentKey === 'tags' && line.startsWith('  - ')) {
        tagLines.push(line.replace('  - ', '').trim());
        continue;
      }
      const kv = line.match(/^([\w-]+):\s*(.*)$/);
      if (kv) {
        currentKey = kv[1];
        frontmatter[kv[1]] = kv[2].trim();
      }
    }

    if (tagLines.length) frontmatter.tags = tagLines;
    else if (frontmatter.tags) frontmatter.tags = frontmatter.tags;

    return { frontmatter, body: fmMatch[2] };
  }
})();
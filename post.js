// Individual blog post reader
// Fixes: CRLF-safe frontmatter parser, marked v9 API, image path resolution
(async function initPost() {

  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('post');

  if (!slug) {
    window.location.href = 'blog.html';
    return;
  }

  document.title = 'Loading... — Shahil Ahmed';

  try {
    const mdRes = await fetch('posts/' + slug + '.md');
    if (!mdRes.ok) throw new Error('Post not found (' + mdRes.status + ')');
    const raw = await mdRes.text();

    const { frontmatter, body } = parseFrontmatter(raw);

    // ── Page title ──────────────────────────────────────────
    document.title = (frontmatter.title || slug) + ' — Shahil Ahmed';

    const titleEl = document.getElementById('post-title');
    const metaEl  = document.getElementById('post-meta');
    const tagsEl  = document.getElementById('post-tags');
    const bodyEl  = document.getElementById('post-body');
    const readEl  = document.getElementById('post-reading-time');

    if (titleEl) titleEl.textContent = frontmatter.title || slug;

    if (metaEl) {
      metaEl.innerHTML =
        '<span>' + (frontmatter.date || '') + '</span>' +
        (frontmatter.author ? '<span>by ' + frontmatter.author + '</span>' : '');
    }

    if (tagsEl && frontmatter.tags && frontmatter.tags.length) {
      tagsEl.innerHTML = frontmatter.tags
        .map(function(t) { return '<span class="blog-tag">' + t + '</span>'; })
        .join('');
    }

    var wordCount = body.trim().split(/\s+/).filter(Boolean).length;
    var mins      = Math.max(1, Math.round(wordCount / 200));
    if (readEl) readEl.textContent = mins + ' min read  \u2022  ' + wordCount + ' words';

    // ── Render Markdown ──────────────────────────────────────
    if (bodyEl && typeof marked !== 'undefined') {

      // marked v9+ API: use marked.use() with a custom renderer extension
      marked.use({
        gfm:    true,
        breaks: true,
        renderer: {
          // Resolve relative image paths to posts/images/<filename>
          image: function(token) {
            var href  = token.href  || token.src  || '';
            var text  = token.text  || token.alt  || '';
            var title = token.title || '';

            var src = href;
            if (src && !src.match(/^https?:\/\//) && !src.startsWith('/') && !src.startsWith('data:')) {
              src = 'posts/images/' + src;
            }

            var titleAttr = title ? ' title="' + title + '"' : '';
            return '<figure>' +
              '<img src="' + src + '" alt="' + text + '"' + titleAttr + ' loading="lazy">' +
              (text ? '<figcaption>' + text + '</figcaption>' : '') +
              '</figure>';
          }
        }
      });

      bodyEl.innerHTML = marked.parse(body);

      // Syntax highlighting
      if (typeof hljs !== 'undefined') {
        bodyEl.querySelectorAll('pre code').forEach(function(block) {
          hljs.highlightElement(block);
        });
      }

    } else if (bodyEl) {
      bodyEl.textContent = body;
    }

  } catch (err) {
    var t = document.getElementById('post-title');
    var b = document.getElementById('post-body');
    if (t) t.textContent = 'Post not found';
    if (b) b.innerHTML   = '<p>This post could not be loaded. <a href="blog.html">Go back to blog.</a></p><p style="font-family:monospace;font-size:0.8rem;opacity:0.5">' + err.message + '</p>';
    console.error('[post.js]', err);
  }

  // ── Frontmatter parser (CRLF + LF safe) ─────────────────
  function parseFrontmatter(raw) {
    // Normalise line endings
    var text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

    // Must start with ---
    if (!text.startsWith('---')) {
      return { frontmatter: {}, body: text };
    }

    // Find closing ---
    var closeIdx = text.indexOf('\n---', 3);
    if (closeIdx === -1) {
      return { frontmatter: {}, body: text };
    }

    var fmBlock = text.slice(3, closeIdx).trim();
    var body    = text.slice(closeIdx + 4).replace(/^\n+/, '');

    var frontmatter = {};
    var currentKey  = null;
    var tagLines    = [];

    fmBlock.split('\n').forEach(function(line) {
      // YAML list item under tags:
      if (currentKey === 'tags' && /^\s+-\s+/.test(line)) {
        tagLines.push(line.replace(/^\s+-\s+/, '').trim());
        return;
      }
      var kv = line.match(/^([\w-]+):\s*(.*)$/);
      if (kv) {
        currentKey          = kv[1];
        frontmatter[kv[1]] = kv[2].trim();
      }
    });

    if (tagLines.length) {
      frontmatter.tags = tagLines;
    } else if (frontmatter.tags) {
      // inline tags: "android, pentesting"
      frontmatter.tags = frontmatter.tags.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    } else {
      frontmatter.tags = [];
    }

    return { frontmatter: frontmatter, body: body };
  }

})();

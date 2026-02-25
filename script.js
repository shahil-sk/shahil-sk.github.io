// ========================
// Data Loading
// ========================
if (document.getElementById('experience-list') || document.getElementById('projects-grid') || document.getElementById('certificates-grid')) {
  fetch('data.json')
    .then(r => r.json())
    .then(data => {
      populateHero(data.hero);
      populateAbout(data.about);
      populateExperience(data.experience);
      populateProjects(data.projects);
      populateSkills(data.skills);
      populateBlogPreview();
      populateContact(data.contact);
      populateCertificatesPage(data.about.certifications);
      populateFooter(data.footer);
      initTypewriter(data.hero.subtitle);
      setTimeout(initSpotlight, 100);
    })
    .catch(() => {
      initTypewriter('OFFENSIVE SECURITY / PENETRATION TESTER / RED TEAM');
    });
}

function populateHero(hero) {
  if (!hero) return;
  const first = document.getElementById('hero-name-first');
  const last  = document.getElementById('hero-name-last');
  if (first) first.textContent = hero.firstName || 'SHAHIL';
  if (last)  { last.textContent = hero.lastName || 'AHMED'; last.setAttribute('data-text', hero.lastName || 'AHMED'); }
  setText('hero-location', hero.location);
  if (hero.stats) hero.stats.forEach((s, i) => {
    setText(`stat-${i+1}-value`, s.value);
    setText(`stat-${i+1}-label`, s.label);
  });
}

function populateAbout(about) {
  if (!about) return;
  setText('about-intro', about.intro);
  setText('about-para-1', about.paragraph1);
  setText('about-para-2', about.paragraph2);
  const edu = document.getElementById('education-content');
  if (edu && about.education) {
    edu.innerHTML = about.education.map(e =>
      `<p>${e.degree}</p><span class="small">${e.institution} · ${e.years}</span>`
    ).join('');
  }
  const certs = document.getElementById('certifications-content');
  if (certs && about.certifications) {
    const certsHTML = about.certifications.map(c =>
      `<div class="cert-item">${typeof c === 'string' ? c : c.name}</div>`
    ).join('');
    certs.innerHTML = `
      <div class="cert-carousel-wrapper">
        <div class="cert-carousel-track">
          ${certsHTML}
          ${certsHTML}
        </div>
      </div>
    `;
  }
}

function populateExperience(experience) {
  if (!experience) return;
  const list = document.getElementById('experience-list');
  if (!list) return;
  list.innerHTML = experience.map((exp, i) => `
    <div class="exp-item" style="transition-delay:${i * 0.12}s">
      <div class="exp-meta"><span class="exp-date">${exp.date}</span></div>
      <div class="exp-company">${exp.company}</div>
      <div class="exp-role">${exp.role}</div>
      <ul class="exp-highlights">${exp.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
    </div>
  `).join('');
}

function populateProjects(projects) {
  if (!projects) return;
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = projects.map((p, i) => `
    <div class="project-card" style="transition-delay:${(i % 3) * 0.08}s">
      <div class="project-num">PROJECT_${String(i+1).padStart(2,'0')}</div>
      <div class="project-name">${p.name}</div>
      <p class="project-desc">${p.description}</p>
      <div class="project-tech">${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>
      <div class="project-footer">
        <span class="project-stars">* ${p.stars || 0}</span>
        <a href="${p.link}" target="_blank" rel="noopener" class="project-link">VIEW →</a>
      </div>
    </div>
  `).join('');
}

function populateSkills(skills) {
  if (!skills) return;
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  grid.innerHTML = Object.entries(skills).map(([cat, list]) => `
    <div class="skill-category">
      <div class="skill-cat-header">
        <span class="skill-cat-title">${cat}</span>
        <span class="skill-cat-line"></span>
      </div>
      <ul class="skill-list">${list.map(s => `<li>${s}</li>`).join('')}</ul>
    </div>
  `).join('');
}

async function populateBlogPreview() {
  const grid = document.getElementById('blog-preview-grid');
  if (!grid) return;
  try {
    const res = await fetch('posts/index.json');
    if (!res.ok) throw new Error();
    const posts = await res.json();
    const latest = posts.slice(0, 4);
    grid.innerHTML = latest.map((post, i) => {
        // Use static URL from index.json, or construct it
        const postUrl = post.url || `posts/${post.slug}.html`;
        
        return `
      <a href="${postUrl}" class="blog-card" style="transition-delay:${i * 0.08}s">
        <span class="blog-card-date">${post.date}</span>
        <span class="blog-card-title">${post.title}</span>
        <span class="blog-card-excerpt">${post.excerpt || ''}</span>
        <div class="blog-card-tags">${(post.tags||[]).map(t=>`<span class="blog-tag">${t}</span>`).join('')}</div>
        <span class="blog-card-arrow">READ →</span>
      </a>
    `}).join('');
    grid.querySelectorAll('.blog-card').forEach(el => revealObserver.observe(el));
  } catch(e) {
    grid.innerHTML = '<div style="padding:2rem;color:var(--text-muted);font-family:var(--mono);font-size:.875rem">No posts yet.</div>';
  }
}

function populateContact(contact) {
  if (!contact) return;
  const grid = document.getElementById('contact-grid');
  if (!grid) return;
  grid.innerHTML = contact.map(c => `
    <a href="${c.link}" target="_blank" rel="noopener" class="contact-card">
      <span class="contact-label">${c.label}</span>
      <span class="contact-value">${c.value}</span>
    </a>
  `).join('');
}

function populateFooter(footer) {
  if (!footer) return;
  setText('footer-copyright', footer.copyright);
  setText('footer-quote', footer.quote);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

// ========================
// Typewriter
// ========================
function initTypewriter(fullText) {
  const el = document.getElementById('tagline-text');
  if (!el || !fullText) return;
  const phrases = fullText.split(' / ');
  let phraseIndex = 0, i = 0, isDeleting = false;

  function type() {
    const phrase = phrases[phraseIndex] || phrases[0];
    el.textContent = isDeleting ? phrase.slice(0, i - 1) : phrase.slice(0, i + 1);
    isDeleting ? i-- : i++;
    if (!isDeleting && i > phrase.length)  { isDeleting = true; setTimeout(type, 1800); return; }
    if (isDeleting && i === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; }
    setTimeout(type, isDeleting ? 48 : 78);
  }
  setTimeout(type, 1200);
}

// ========================
// Matrix Canvas
// ========================
(function() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
  const fontSize = 13;
  let cols, drops;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / fontSize);
    drops = new Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(3,3,3,0.055)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FF0000';
    ctx.font = `${fontSize}px JetBrains Mono, monospace`;
    for (let i = 0; i < drops.length; i++) {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 55);
})();

// ========================
// Custom Cursor
// ========================
(function() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;
  let mx = 0, my = 0, fx = 0, fy = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function anim() {
    fx += (mx - fx) * 0.11;
    fy += (my - fy) * 0.11;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(anim);
  })();

  document.querySelectorAll('a, button, .project-card, .contact-card, .info-card, .blog-card, .cert-page-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
  });
})();

// ========================
// Scroll Progress
// ========================
window.addEventListener('scroll', () => {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  bar.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
}, { passive: true });

// ========================
// Header
// ========================
(function() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

// ========================
// Active Nav
// ========================
(function() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting)
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { threshold: 0.35 }).observe;
  sections.forEach(s => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting)
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      });
    }, { threshold: 0.35 }).observe(s);
  });
})();

// ========================
// Reveal
// ========================
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal, .exp-item, .project-card, .skill-category, .blog-card, .cert-page-card').forEach(el => revealObserver.observe(el));
}
initReveal();

new MutationObserver(() => {
  document.querySelectorAll('.reveal:not(.visible), .exp-item:not(.visible), .project-card:not(.visible), .skill-category:not(.visible), .blog-card:not(.visible), .cert-page-card:not(.visible)')
    .forEach(el => revealObserver.observe(el));
}).observe(document.body, { childList: true, subtree: true });

// ========================
// Mobile Menu
// ========================
(function() {
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });
  menu.querySelectorAll('.mobile-nav-link').forEach(l => l.addEventListener('click', () => {
    toggle.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }));
})();

// ========================
// Spotlight Effect
// ========================
function initSpotlight() {
  const cards = document.querySelectorAll('.project-card, .skill-category, .blog-card, .info-card, .contact-card, .cert-page-card');
  cards.forEach(card => {
    if (!card.querySelector('.spotlight-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'spotlight-overlay';
      card.appendChild(overlay);
    }
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// ========================
// Certificates Page
// ========================
function populateCertificatesPage(certs) {
  const grid = document.getElementById('certificates-grid');
  if (!grid || !certs) return;
  grid.innerHTML = certs.map((c, i) => `
    <a href="${c.file || '#'}" target="_blank" rel="noopener" class="cert-page-card reveal" style="transition-delay:${(i % 3) * 0.08}s">
      <div class="cert-page-meta">
        <span class="cert-page-date">${c.date || ''}</span>
        <span class="cert-page-issuer">${c.issuer || ''}</span>
      </div>
      <h3 class="cert-page-title">${typeof c === 'string' ? c : c.name}</h3>
      <div class="cert-page-arrow">VIEW DOCUMENT ↗</div>
    </a>
  `).join('');
  grid.querySelectorAll('.cert-page-card').forEach(el => revealObserver.observe(el));
}
// ========================
// Data Loading
// ========================
fetch('data.json')
  .then(r => r.json())
  .then(data => {
    populateHero(data.hero);
    populateAbout(data.about);
    populateExperience(data.experience);
    populateProjects(data.projects);
    populateSkills(data.skills);
    populateContact(data.contact);
    populateFooter(data.footer);
    initTypewriter(data.hero.subtitle);
  })
  .catch(() => {
    // Fallback: use static content already in HTML
    initTypewriter('OFFENSIVE SECURITY / PENETRATION TESTER / RED TEAM');
  });

function populateHero(hero) {
  if (!hero) return;
  const logoEl = document.getElementById('logo-link');
  if (logoEl) logoEl.querySelector('.logo-text').textContent = hero.logo || 'SK';
  const first = document.getElementById('hero-name-first');
  const last = document.getElementById('hero-name-last');
  if (first) first.textContent = hero.firstName || 'SHAHIL';
  if (last) { last.textContent = hero.lastName || 'AHMED'; last.setAttribute('data-text', hero.lastName || 'AHMED'); }
  const loc = document.getElementById('hero-location');
  if (loc) loc.textContent = hero.location || '';
  if (hero.stats) {
    hero.stats.forEach((s, i) => {
      const v = document.getElementById(`stat-${i+1}-value`);
      const l = document.getElementById(`stat-${i+1}-label`);
      if (v) v.textContent = s.value;
      if (l) l.textContent = s.label;
    });
  }
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
    certs.innerHTML = about.certifications.map(c =>
      `<div class="cert-item">${c}</div>`
    ).join('');
  }
}

function populateExperience(experience) {
  if (!experience) return;
  const list = document.getElementById('experience-list');
  if (!list) return;
  list.innerHTML = experience.map((exp, i) => `
    <div class="exp-item" style="transition-delay:${i * 0.15}s">
      <div class="exp-meta">
        <span class="exp-date">${exp.date}</span>
      </div>
      <div class="exp-company">${exp.company}</div>
      <div class="exp-role">${exp.role}</div>
      <ul class="exp-highlights">
        ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function populateProjects(projects) {
  if (!projects) return;
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = projects.map((p, i) => `
    <div class="project-card" style="transition-delay:${(i % 3) * 0.1}s">
      <div class="project-num">PROJECT_${String(i + 1).padStart(2, '0')}</div>
      <div class="project-name">${p.name}</div>
      <p class="project-desc">${p.description}</p>
      <div class="project-tech">${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>
      <div class="project-footer">
        <span class="project-stars">★ ${p.stars || 0}</span>
        <a href="${p.link}" target="_blank" rel="noopener" class="project-link">VIEW <span>→</span></a>
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
      <ul class="skill-list">
        ${list.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  `).join('');
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
  let i = 0;
  let isDeleting = false;
  let currentText = '';
  const phrases = fullText.split(' / ');
  let phraseIndex = 0;

  function type() {
    const phrase = phrases[phraseIndex] || phrases[0];
    if (!isDeleting) {
      currentText = phrase.slice(0, i + 1);
      i++;
      if (i > phrase.length) {
        isDeleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      currentText = phrase.slice(0, i - 1);
      i--;
      if (i === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    el.textContent = currentText;
    setTimeout(type, isDeleting ? 50 : 80);
  }
  setTimeout(type, 1200);
}

// ========================
// Matrix Rain Canvas
// ========================
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let cols, drops;
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const fontSize = 14;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / fontSize);
    drops = new Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(3, 3, 3, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FF0000';
    ctx.font = `${fontSize}px JetBrains Mono, monospace`;
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 50);
})();

// ========================
// Custom Cursor
// ========================
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .project-card, .contact-card, .info-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });
})();

// ========================
// Scroll Progress
// ========================
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    const pct = (window.scrollY / max) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

// ========================
// Header Scroll Effect
// ========================
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastY = y;
  }, { passive: true });
})();

// ========================
// Active Nav Link
// ========================
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

// ========================
// Reveal on Scroll
// ========================
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal, .exp-item, .project-card, .skill-category');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));

  // Also observe dynamically added elements
  const mo = new MutationObserver(() => {
    document.querySelectorAll('.reveal:not(.visible), .exp-item:not(.visible), .project-card:not(.visible), .skill-category:not(.visible)').forEach(el => {
      observer.observe(el);
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();

// ========================
// Mobile Menu
// ========================
(function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();
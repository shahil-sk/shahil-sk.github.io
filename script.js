// Custom cursor
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor-dot');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Cursor interaction
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .exp-item, .skill-category, .contact-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });

    // Scroll progress bar
    createScrollProgress();

    // Load data
    loadPortfolioData();

    // Intersection Observer for animations
    observeElements();

    // Header hide on scroll down
    handleHeaderScroll();
});

// Scroll progress bar
function createScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Header hide/show on scroll
function handleHeaderScroll() {
    let lastScroll = 0;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('hidden');
            return;
        }

        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScroll = currentScroll;
    });
}

// Intersection Observer for scroll animations
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });

    // Observe cards with delay
    const cards = document.querySelectorAll('.exp-item, .project-card, .skill-category');
    cards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

// Load and render data
async function loadPortfolioData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load data.json');
        }
        const data = await response.json();
        renderData(data);
    } catch (error) {
        console.error('Error loading data:', error);
        showFallbackMessage();
    }
}

function showFallbackMessage() {
    const fallbackStyle = 'color: var(--gray); padding: 2rem; text-align: center;';
    document.getElementById('experience-list').innerHTML = `<p style="${fallbackStyle}">Loading experience data...</p>`;
    document.getElementById('projects-grid').innerHTML = `<p style="${fallbackStyle}">Loading projects data...</p>`;
    document.getElementById('skills-grid').innerHTML = `<p style="${fallbackStyle}">Loading skills data...</p>`;
}

function renderData(data) {
    // Render Hero
    if (data.hero) {
        if (data.hero.logo) {
            document.getElementById('header-logo').textContent = data.hero.logo;
        }
        if (data.hero.firstName) {
            document.getElementById('hero-name-first').textContent = data.hero.firstName;
        }
        if (data.hero.lastName) {
            document.getElementById('hero-name-last').textContent = data.hero.lastName;
        }
        if (data.hero.subtitle) {
            document.getElementById('hero-role').textContent = data.hero.subtitle.toUpperCase();
        }
        if (data.hero.location) {
            document.getElementById('hero-location').textContent = data.hero.location;
        }
        if (data.hero.videoUrl) {
            const video = document.getElementById('hero-video');
            video.src = data.hero.videoUrl;
        }
        if (data.hero.stats && data.hero.stats.length > 0) {
            data.hero.stats.forEach((stat, index) => {
                const valueEl = document.getElementById(`stat-${index + 1}-value`);
                const labelEl = document.getElementById(`stat-${index + 1}-label`);
                if (valueEl) valueEl.textContent = stat.value;
                if (labelEl) labelEl.textContent = stat.label;
            });
        }
    }

    // Render About
    if (data.about) {
        if (data.about.intro) {
            document.getElementById('about-intro').textContent = data.about.intro;
        }
        if (data.about.paragraph1) {
            document.getElementById('about-para-1').textContent = data.about.paragraph1;
        }
        if (data.about.paragraph2) {
            document.getElementById('about-para-2').textContent = data.about.paragraph2;
        }
        
        // Education
        if (data.about.education && data.about.education.length > 0) {
            const eduContent = document.getElementById('education-content');
            eduContent.innerHTML = data.about.education.map(edu => `
                <p>${edu.degree}</p>
                <p class="small">${edu.institution} • ${edu.years}</p>
            `).join('');
        }
        
        // Certifications
        if (data.about.certifications && data.about.certifications.length > 0) {
            const certContent = document.getElementById('certifications-content');
            certContent.innerHTML = data.about.certifications.map(cert => `<p>${cert}</p>`).join('');
        }
    }

    // Render Experience
    if (data.experience && data.experience.length > 0) {
        const expList = document.getElementById('experience-list');
        expList.innerHTML = data.experience.map(exp => `
            <div class="exp-item">
                <div class="exp-header">
                    <div>
                        <div class="exp-role">${exp.role}</div>
                        <div class="exp-company">${exp.company}</div>
                    </div>
                    <div class="exp-date">${exp.date}</div>
                </div>
                <ul class="exp-highlights">
                    ${exp.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                </ul>
            </div>
        `).join('');
        
        // Re-observe new elements
        setTimeout(() => {
            document.querySelectorAll('.exp-item').forEach(item => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                        }
                    });
                }, { threshold: 0.1 });
                observer.observe(item);
            });
        }, 100);
    }

    // Render Projects
    if (data.projects && data.projects.length > 0) {
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = data.projects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <h3 class="project-name">${project.name}</h3>
                    ${project.stars !== undefined ? `<span class="project-stars">★ ${project.stars}</span>` : ''}
                </div>
                <p class="project-desc">${project.description}</p>
                <div class="project-tech">
                    ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <a href="${project.link}" target="_blank" rel="noopener" class="project-link">View Project</a>
            </div>
        `).join('');
        
        // Re-observe new elements
        setTimeout(() => {
            document.querySelectorAll('.project-card').forEach(card => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                        }
                    });
                }, { threshold: 0.1 });
                observer.observe(card);
            });
        }, 100);
    }

    // Render Skills
    if (data.skills && Object.keys(data.skills).length > 0) {
        const skillsGrid = document.getElementById('skills-grid');
        skillsGrid.innerHTML = Object.entries(data.skills).map(([category, skills]) => `
            <div class="skill-category">
                <h3>${category}</h3>
                <ul class="skill-list">
                    ${skills.map(skill => `<li>${skill}</li>`).join('')}
                </ul>
            </div>
        `).join('');
        
        // Re-observe new elements
        setTimeout(() => {
            document.querySelectorAll('.skill-category').forEach(cat => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                        }
                    });
                }, { threshold: 0.1 });
                observer.observe(cat);
            });
        }, 100);
    }

    // Render Contact
    if (data.contact && data.contact.length > 0) {
        const contactGrid = document.getElementById('contact-grid');
        contactGrid.innerHTML = data.contact.map(contact => `
            <a href="${contact.link}" target="_blank" rel="noopener" class="contact-card">
                <span class="contact-label">${contact.label}</span>
                <span class="contact-value">${contact.value}</span>
            </a>
        `).join('');
    }

    // Render Footer
    if (data.footer) {
        if (data.footer.copyright) {
            document.getElementById('footer-copyright').textContent = data.footer.copyright;
        }
        if (data.footer.quote) {
            document.getElementById('footer-quote').textContent = data.footer.quote;
        }
    }

    // Add cursor interaction to newly created elements
    const interactiveElements = document.querySelectorAll('.project-card, .exp-item, .skill-category, .contact-card');
    const cursor = document.querySelector('.cursor-dot');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active nav link on scroll
let sections = [];
let navLinks = [];

window.addEventListener('load', () => {
    sections = document.querySelectorAll('.section[id]');
    navLinks = document.querySelectorAll('.nav a[href^="#"]');
});

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

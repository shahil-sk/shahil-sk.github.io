// Initialize GSAP and ScrollTrigger
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Custom easing for cinematic hardware motion
const easeHeavy = "expo.out";

// Load blog posts dynamically into the hyper-grid
async function populateBlogPreview() {
  const grid = document.getElementById('blog-preview-grid');
  if (!grid) return;
  
  const OWNER = 'shahil-sk';
  const REPO = 'shahil-sk.github.io';
  const BRANCH = 'main';
  const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/blog/content?ref=${BRANCH}`;
  
  let allPosts = [];
  
  try {
    const isBlogPath = window.location.pathname.includes('/blog/') || window.location.pathname.endsWith('/blog.html');
    const indexUrl = isBlogPath ? 'posts/index.json' : 'blog/posts/index.json';
    const res = await fetch(indexUrl + '?' + Date.now());
    if (!res.ok) throw new Error();
    allPosts = await res.json();
  } catch(e) {
    console.warn('Index load failed, falling back to API:', e);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('API ' + res.status);
      const dir = await res.json();
      const mdFiles = dir.filter(f => f.type === 'file' && f.name.endsWith('.md'));
      
      const results = await Promise.allSettled(
        mdFiles.map(async (file) => {
          const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/blog/content/${file.name}`;
          const r = await fetch(rawUrl);
          if (!r.ok) throw new Error();
          const text = await r.text();
          const slug = file.name.replace(/\.md$/, '');
          
          let title = slug;
          let dateStr = '';
          const titleMatch = text.match(/^title:\s*(.*)$/m);
          if (titleMatch) title = titleMatch[1].trim();
          const dateMatch = text.match(/^date:\s*(.*)$/m);
          if (dateMatch) dateStr = dateMatch[1].trim();
          
          return { slug, title, date: dateStr, url: `posts/${slug}.html` };
        })
      );
      
      allPosts = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    } catch (err) {
      grid.innerHTML = '<div class="text-accent font-bold text-micro border border-accent p-4 inline-block">ERROR: FAILED TO FETCH TRANSMISSIONS</div>';
      return;
    }
  }

  // Ensure latest blogs show first
  allPosts.sort((a, b) => {
      const dateA = new Date(a.date || a.pubDate || 0);
      const dateB = new Date(b.date || b.pubDate || 0);
      return dateB - dateA;
  });

  const latest = allPosts.slice(0, 4);
  
  grid.innerHTML = '';
  const isBlogPath = window.location.pathname.includes('/blog/') || window.location.pathname.endsWith('/blog.html');
  
  latest.forEach((item, index) => {
    const article = document.createElement('a');
    const itemUrl = item.url || `posts/${item.slug}.html`;
    article.href = isBlogPath ? itemUrl : `blog/${itemUrl}`;
    article.className = 'grid grid-cols-1 md:grid-cols-12 gap-4 items-center group cursor-pointer border-b border-ink/10 py-6 hover:bg-ink/5 transition-colors duration-300';
    
    const date = new Date(item.date || item.pubDate);
    const formattedDate = !isNaN(date) ? date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.') : 'UNKNOWN.DATE';

    article.innerHTML = `
      <div class="md:col-span-2 text-micro text-ink/50 group-hover:text-ink transition-colors">${formattedDate}</div>
      <div class="md:col-span-1 text-micro text-accent/50 group-hover:text-accent transition-colors hidden md:block">0${index + 1}</div>
      <h3 class="md:col-span-7 text-macro text-2xl md:text-3xl text-ink group-hover:text-accent transition-colors uppercase leading-none mt-2 md:mt-0">${item.title}</h3>
      <div class="md:col-span-2 text-left md:text-right text-micro text-ink/40 group-hover:text-accent transition-colors mt-4 md:mt-0">
          [ EXECUTE_READ ]
      </div>
    `;
    
    grid.appendChild(article);
  });
  
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
}

// GSAP Animations
function initAnimations() {
  if (typeof gsap === 'undefined') return;
  let mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    
    // 2. CSS handles the pin via `sticky top-32`, removing buggy GSAP pin conflict.

    // 3. Text Color Scrubbing
    gsap.utils.toArray('.gs-scrub-text').forEach((text) => {
        gsap.to(text, {
            scrollTrigger: {
                trigger: "#arsenal",
                start: "top center",
                end: "bottom center",
                scrub: true
            },
            color: "#FF2A2A", // shift to accent
            ease: "none"
        });
    });
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.utils.toArray('.gs-reveal-up').forEach((elem) => {
      gsap.from(elem, {
        scrollTrigger: {
          trigger: elem,
          start: "top 90%",
        },
        opacity: 0,
        duration: 0.8
      });
    });
  });
}

// Load GitHub Projects dynamically
async function populateGithubProjects() {
    const container = document.getElementById('github-projects-container');
    if (!container) return;
    
    try {
        const res = await fetch('https://api.github.com/users/shahil-sk/repos?sort=updated&per_page=15');
        if (!res.ok) throw new Error();
        let repos = await res.json();
        
        // Filter out the portfolio itself or forks
        repos = repos.filter(r => !r.fork && r.name !== 'shahil-sk.github.io');
        // Take top 3
        repos = repos.slice(0, 3);
        
        container.innerHTML = '';
        
        repos.forEach(repo => {
            const el = document.createElement('a');
            el.href = repo.html_url;
            el.target = '_blank';
            el.className = 'px-8 py-12 md:px-16 md:py-16 group hover:bg-ink/5 focus:bg-ink/5 focus:outline-none transition-colors duration-300 flex-1 flex flex-col justify-center border-b border-ink/10 relative z-10';
            
            const desc = (repo.description || 'CLASSIFIED SYSTEM ARCHITECTURE. NO DESCRIPTION PROVIDED.').toUpperCase();
            const lang = repo.language ? `[ ${repo.language.toUpperCase()} ]` : '[ UNKNOWN ]';
            
            el.innerHTML = `
                <div class="flex justify-between items-center mb-4 w-full">
                    <h3 class="text-macro text-4xl md:text-5xl font-bold group-hover:text-accent transition-colors">${repo.name}</h3>
                    <span class="text-macro text-3xl group-hover:translate-x-2 transition-transform">↗</span>
                </div>
                <p class="text-micro text-ink/60 group-hover:text-canvas/80 group-focus:text-canvas/80 max-w-md mb-6">${desc}</p>
                <div class="flex gap-6 items-center">
                    <span class="text-micro text-accent">${lang}</span>
                    <span class="text-micro text-ink/40">★ ${repo.stargazers_count}</span>
                </div>
            `;
            container.appendChild(el);
        });
        
        // Add View All Link at the bottom
        const viewAll = document.createElement('a');
        viewAll.href = 'https://github.com/shahil-sk';
        viewAll.target = '_blank';
        viewAll.className = 'p-8 md:p-16 group hover:bg-accent focus:bg-accent hover:text-canvas focus:text-canvas focus:outline-none transition-colors duration-300 flex-1 flex justify-between items-center relative z-10';
        viewAll.innerHTML = `
            <span class="text-macro text-2xl md:text-3xl font-bold">ACCESS_FULL_GITHUB_ARCHIVE</span>
            <span class="text-macro text-3xl group-hover:translate-x-2 transition-transform">→</span>
        `;
        container.appendChild(viewAll);
        
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    } catch(e) {
        console.warn('Failed to fetch github repos:', e);
        container.innerHTML = '<div class="px-8 py-12 text-accent font-bold text-micro border border-accent p-4 inline-block m-8 md:m-16">ERROR: FAILED TO SYNC REPOSITORIES</div>';
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  populateBlogPreview().then(() => {
    initAnimations();
  });
  populateGithubProjects();
});

// --- Nav Terminal Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const terminalToggle = document.getElementById('terminal-toggle');
    const navTerminal = document.getElementById('nav-terminal');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const fakeInputText = document.getElementById('fake-input-text');

    if (!terminalToggle || !navTerminal || !terminalInput || !terminalOutput) return;

    // Toggle dropdown
    terminalToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navTerminal.classList.contains('hidden')) {
            navTerminal.classList.remove('hidden');
            setTimeout(() => {
                navTerminal.classList.remove('opacity-0', '-translate-y-4');
                navTerminal.classList.add('opacity-100', 'translate-y-0');
                terminalInput.focus();
            }, 10);
        } else {
            closeTerminal();
        }
    });

    function closeTerminal() {
        navTerminal.classList.remove('opacity-100', 'translate-y-0');
        navTerminal.classList.add('opacity-0', '-translate-y-4');
        setTimeout(() => {
            navTerminal.classList.add('hidden');
        }, 260);
        terminalInput.blur();
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!navTerminal.contains(e.target) && !terminalToggle.contains(e.target)) {
            if (!navTerminal.classList.contains('hidden')) {
                closeTerminal();
            }
        }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !navTerminal.classList.contains('hidden')) {
            closeTerminal();
        }
    });

    if (fakeInputText) {
        terminalInput.addEventListener('input', () => {
            fakeInputText.textContent = terminalInput.value;
        });
    }

    const commands = {
        'help': 'Available commands:\n  whoami    - Display user identity\n  ls        - List active operations\n  cd [dir]  - Navigate to module (arsenal, expertise, logs, root)\n  cat logs  - Stream raw transmissions\n  dismantle - [WARNING] Strip UI architecture\n  clear     - Clear terminal output',
        'whoami': 'Shahil Ahmed\nRole: Offensive Security / Systems Breaker\nStatus: Active (Monitoring)',
        'ls': 'Operations Archive:\n  drwxr-xr-x  arsenal/\n  drwxr-xr-x  expertise/\n  drwxr-xr-x  logs/',
        'sudo': 'Access denied. This incident will be reported.'
    };

    function navigateTo(id) {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setTimeout(closeTerminal, 600);
            return `Navigating to /${id}...`;
        }
        return `bash: cd: ${id}: No such directory`;
    }

    // Intruder Detection (Data Exfiltration Tracking)
    document.addEventListener('copy', () => {
        const selection = document.getSelection().toString();
        if (!selection) return;
        const bytes = new Blob([selection]).size;
        
        if (navTerminal.classList.contains('hidden')) {
            terminalToggle.click();
        }
        
        const responseNode = document.createElement('div');
        responseNode.className = 'text-[#ff3333] font-bold mb-4 whitespace-pre';
        responseNode.textContent = `[SECURITY_ALERT] Unauthorized data exfiltration detected. ${bytes} bytes copied to clipboard.`;
        terminalOutput.appendChild(responseNode);
        terminalOutput.scrollTo(0, terminalOutput.scrollHeight);
    });

    // Custom Context Menu
    const contextMenu = document.createElement('div');
    contextMenu.id = 'custom-context-menu';
    contextMenu.className = 'fixed bg-canvas border border-ink/20 flex flex-col z-[9999] opacity-0 pointer-events-none transition-opacity duration-200 text-micro shadow-2xl';
    
    const menuOptions = [
        { label: '[ INITIATE_TERMINAL ]', action: () => { if (navTerminal.classList.contains('hidden')) terminalToggle.click(); } },
        { label: '[ COPY_URL ]', action: () => { navigator.clipboard.writeText(window.location.href); } },
        { label: '[ NAVIGATE_ROOT ]', action: () => { window.location.href = window.location.pathname.includes('/blog/') ? '../index.html' : 'index.html'; } }
    ];

    menuOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'px-6 py-4 text-left text-ink/70 hover:bg-ink hover:text-canvas transition-colors w-full border-b border-ink/10 last:border-b-0 uppercase';
        btn.textContent = opt.label;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            opt.action();
            contextMenu.classList.add('opacity-0', 'pointer-events-none');
        });
        contextMenu.appendChild(btn);
    });

    document.body.appendChild(contextMenu);

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        // Position menu
        const menuWidth = 200; // estimated width
        const menuHeight = 150; // estimated height
        let x = e.clientX;
        let y = e.clientY;
        
        // Prevent overflowing screen
        if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
        if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;
        
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.remove('opacity-0', 'pointer-events-none');
    });

    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    // Handle commands
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.trim().toLowerCase();
            if (!cmd) return;

            // Echo command
            const echoNode = document.createElement('div');
            echoNode.innerHTML = `<span class="text-accent">root@sk:~#</span> ${cmd}`;
            terminalOutput.appendChild(echoNode);

            // Execute command
            if (cmd === 'clear') {
                terminalOutput.innerHTML = '';
            } else if (cmd === 'sudo dismantle' || cmd === 'dismantle' || cmd === 'sudo dismantle ui') {
                const responseNode = document.createElement('div');
                responseNode.className = 'text-[#ff3333] font-bold mb-4 whitespace-pre';
                responseNode.textContent = 'INITIATING ARCHITECTURE DISMANTLING PROTOCOL...\nPurging CSS Object Model...\nStripping Vector Graphics...\nRendering Raw DOM.';
                terminalOutput.appendChild(responseNode);
                terminalOutput.scrollTo(0, terminalOutput.scrollHeight);
                
                setTimeout(() => {
                    // Protect terminal and meta tags
                    const protectedElements = new Set();
                    document.querySelectorAll('#nav-terminal, #nav-terminal *, #terminal-toggle, #terminal-toggle *, script, style, link, head, head *').forEach(el => protectedElements.add(el));
                    
                    document.querySelectorAll('*').forEach(el => {
                        if (!protectedElements.has(el) && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
                            el.removeAttribute('class');
                            el.removeAttribute('style');
                        }
                    });
                    
                    document.querySelectorAll('svg').forEach(svg => {
                        if (!protectedElements.has(svg)) {
                            svg.remove();
                        }
                    });
                    
                    document.body.style.backgroundColor = '#050505';
                    document.body.style.color = '#eaeaea';
                    document.body.style.fontFamily = 'monospace';
                    
                    setTimeout(closeTerminal, 1000);
                }, 1500);
            } else if (cmd.startsWith('cd ')) {
                const dir = cmd.split(' ')[1];
                let response = '';
                if (dir === '/' || dir === '~' || dir === 'root' || dir === 'hero') {
                    response = navigateTo('hero');
                } else if (dir === 'arsenal' || dir === 'projects') {
                    response = navigateTo('arsenal');
                } else if (dir === 'expertise' || dir === 'skills') {
                    response = navigateTo('expertise');
                } else if (dir === 'logs' || dir === 'transmissions') {
                    response = navigateTo('logs');
                } else {
                    response = `bash: cd: ${dir}: No such file or directory`;
                }
                const responseNode = document.createElement('div');
                responseNode.className = 'text-ink/70 opacity-80 mb-4 whitespace-pre';
                responseNode.textContent = response;
                terminalOutput.appendChild(responseNode);
            } else if (cmd === 'cat logs' || cmd === 'cat transmissions') {
                const response = navigateTo('logs');
                const responseNode = document.createElement('div');
                responseNode.className = 'text-ink/70 opacity-80 mb-4 whitespace-pre';
                responseNode.textContent = response + '\nStreaming data...';
                terminalOutput.appendChild(responseNode);
            } else {
                const response = commands[cmd] || `bash: ${cmd}: command not found`;
                const responseNode = document.createElement('div');
                responseNode.className = 'text-ink/70 opacity-80 mb-4 whitespace-pre';
                responseNode.textContent = response;
                terminalOutput.appendChild(responseNode);
            }

            terminalInput.value = '';
            if (fakeInputText) fakeInputText.textContent = '';
            terminalOutput.scrollTo(0, terminalOutput.scrollHeight);
        }
    });
    
    // Keep focus on input when clicking anywhere inside terminal
    navTerminal.addEventListener('click', () => {
        terminalInput.focus();
    });
});
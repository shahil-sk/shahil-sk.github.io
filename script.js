// Initialize GSAP and ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Custom easing for cinematic hardware motion
const easeHeavy = "expo.out";

// Load blog posts dynamically into the hyper-grid
async function populateBlogPreview() {
  const grid = document.getElementById('blog-preview-grid');
  if (!grid) return;
  try {
    const res = await fetch('posts/index.json');
    if (!res.ok) throw new Error();
    const posts = await res.json();
    const latest = posts.slice(0, 4);
    
    grid.innerHTML = '';
    latest.forEach((item, index) => {
      const article = document.createElement('a');
      article.href = item.url || `posts/${item.slug}.html`;
      article.className = 'grid grid-cols-1 md:grid-cols-12 gap-4 items-center group cursor-pointer border-b border-ink/10 py-6 hover:bg-ink/5 transition-colors duration-300';
      
      const date = new Date(item.date || item.pubDate); // Using standard or RSS date
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
    
    // Refresh ScrollTrigger after DOM changes
    ScrollTrigger.refresh();
  } catch(e) {
    grid.innerHTML = '<div class="text-accent font-bold text-micro border border-accent p-4 inline-block">ERROR: FAILED TO FETCH TRANSMISSIONS</div>';
  }
}

// GSAP Animations
function initAnimations() {
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

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  populateBlogPreview().then(() => {
    initAnimations();
  });
});
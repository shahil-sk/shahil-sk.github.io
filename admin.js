// ============================================================
// STATE
// ============================================================
let data = {
  hero: { logo:'SK', firstName:'SHAHIL', lastName:'AHMED', subtitle:'OFFENSIVE SECURITY / PENETRATION TESTER / RED TEAM', location:'Mangaluru, Karnataka • Available for Projects', videoUrl:'', stats:[] },
  about: { intro:'', paragraph1:'', paragraph2:'', education:[], certifications:[] },
  experience: [],
  projects: [],
  skills: {},
  contact: [],
  footer: { copyright:'© 2026 SHAHIL AHMED', quote:'"I don\'t know why i like 1\'s and 0\'s"' }
};

let posts = [];          // posts/index.json
let currentPost = null;  // post being edited
let ghToken = '';

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  ghToken = localStorage.getItem('sk_gh_token') || '';
  if (ghToken) document.getElementById('gh-token').value = '••••••••';

  // Tab switching
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'blog') loadBlogPosts();
    });
  });

  // Live preview in blog editor
  const bodyEl = document.getElementById('post-body');
  if (bodyEl) {
    bodyEl.addEventListener('input', () => {
      renderPreview();
      updateWordCount();
      autoSlug();
    });
  }
  document.getElementById('post-title')?.addEventListener('input', autoSlug);

  loadData();
});

function saveToken() {
  const val = document.getElementById('gh-token').value.trim();
  if (val && val !== '••••••••') {
    ghToken = val;
    localStorage.setItem('sk_gh_token', val);
    document.getElementById('gh-token').value = '••••••••';
    setStatus('Token saved.', 'ok');
  }
}

// ============================================================
// DATA LOADING
// ============================================================
async function loadData() {
  try {
    const r = await fetch('data.json?' + Date.now());
    data = await r.json();
  } catch(e) { /* use defaults */ }
  renderAll();
}

async function loadBlogPosts() {
  try {
    const r = await fetch('posts/index.json?' + Date.now());
    posts = await r.json();
  } catch(e) { posts = []; }
  renderPostList();
}

// ============================================================
// RENDER ALL
// ============================================================
function renderAll() {
  renderHero(); renderAbout(); renderExperience();
  renderProjects(); renderSkills(); renderContact(); renderFooter();
}

// ============================================================
// HERO
// ============================================================
function renderHero() {
  v('hero-logo', data.hero.logo);
  v('hero-firstname', data.hero.firstName);
  v('hero-lastname', data.hero.lastName);
  v('hero-subtitle', data.hero.subtitle);
  v('hero-location', data.hero.location);
  v('hero-video', data.hero.videoUrl);
  renderStats();
}
function collectHero() {
  data.hero.logo       = g('hero-logo');
  data.hero.firstName  = g('hero-firstname');
  data.hero.lastName   = g('hero-lastname');
  data.hero.subtitle   = g('hero-subtitle');
  data.hero.location   = g('hero-location');
  data.hero.videoUrl   = g('hero-video');
  collectStats();
}
function renderStats() {
  const el = document.getElementById('stats-list');
  el.innerHTML = data.hero.stats.map((s,i) => `
    <div class="card">
      <div class="card-header">
        <span class="card-title">STAT ${i+1}</span>
        <button class="btn-remove" onclick="removeStat(${i})">REMOVE</button>
      </div>
      <div class="form-grid">
        <div class="field"><label>VALUE</label><input value="${s.value||''}" onchange="data.hero.stats[${i}].value=this.value"></div>
        <div class="field"><label>LABEL</label><input value="${s.label||''}" onchange="data.hero.stats[${i}].label=this.value"></div>
      </div>
    </div>`).join('');
}
function addStat() { data.hero.stats.push({value:'',label:''}); renderStats(); }
function removeStat(i) { data.hero.stats.splice(i,1); renderStats(); }
function collectStats() {
  document.querySelectorAll('#stats-list .card').forEach((card,i) => {
    const inputs = card.querySelectorAll('input');
    if (data.hero.stats[i]) { data.hero.stats[i].value=inputs[0].value; data.hero.stats[i].label=inputs[1].value; }
  });
}

// ============================================================
// ABOUT
// ============================================================
function renderAbout() {
  v('about-intro', data.about.intro);
  v('about-para1', data.about.paragraph1);
  v('about-para2', data.about.paragraph2);
  renderEducation(); renderCerts();
}
function collectAbout() {
  data.about.intro      = g('about-intro');
  data.about.paragraph1 = g('about-para1');
  data.about.paragraph2 = g('about-para2');
  collectEducation(); collectCerts();
}
function renderEducation() {
  document.getElementById('education-list').innerHTML = (data.about.education||[]).map((e,i)=>`
    <div class="card">
      <div class="card-header"><span class="card-title">${e.institution||'New'}</span><button class="btn-remove" onclick="removeEdu(${i})">REMOVE</button></div>
      <div class="form-grid">
        <div class="field full"><label>DEGREE</label><input value="${e.degree||''}" onchange="data.about.education[${i}].degree=this.value"></div>
        <div class="field"><label>INSTITUTION</label><input value="${e.institution||''}" onchange="data.about.education[${i}].institution=this.value"></div>
        <div class="field"><label>YEARS</label><input value="${e.years||''}" onchange="data.about.education[${i}].years=this.value"></div>
      </div>
    </div>`).join('');
}
function addEducation() { data.about.education.push({degree:'',institution:'',years:''}); renderEducation(); }
function removeEdu(i) { data.about.education.splice(i,1); renderEducation(); }
function collectEducation() {
  document.querySelectorAll('#education-list .card').forEach((card,i) => {
    const ins = card.querySelectorAll('input');
    if (data.about.education[i]) { data.about.education[i].degree=ins[0].value; data.about.education[i].institution=ins[1].value; data.about.education[i].years=ins[2].value; }
  });
}
function renderCerts() {
  document.getElementById('cert-list').innerHTML = (data.about.certifications||[]).map((c,i)=>`
    <div class="card">
      <div class="card-header"><span class="card-title">${c}</span><button class="btn-remove" onclick="removeCert(${i})">REMOVE</button></div>
      <div class="field"><label>CERTIFICATION</label><input value="${c}" onchange="data.about.certifications[${i}]=this.value"></div>
    </div>`).join('');
}
function addCert() { data.about.certifications.push(''); renderCerts(); }
function removeCert(i) { data.about.certifications.splice(i,1); renderCerts(); }
function collectCerts() {
  document.querySelectorAll('#cert-list .card').forEach((card,i) => {
    const inp = card.querySelector('input');
    if (data.about.certifications[i] !== undefined) data.about.certifications[i] = inp.value;
  });
}

// ============================================================
// EXPERIENCE
// ============================================================
function renderExperience() {
  document.getElementById('experience-list').innerHTML = (data.experience||[]).map((e,i)=>`
    <div class="card" draggable="true" data-index="${i}" data-type="experience">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:.5rem">
          <span class="drag-handle">::</span>
          <span class="card-title">${e.company||'New'} — ${e.role||''}</span>
        </div>
        <button class="btn-remove" onclick="removeExp(${i})">REMOVE</button>
      </div>
      <div class="form-grid">
        <div class="field"><label>COMPANY</label><input value="${e.company||''}" onchange="data.experience[${i}].company=this.value;this.closest('.card').querySelector('.card-title').textContent=this.value+' — '+data.experience[${i}].role"></div>
        <div class="field"><label>ROLE</label><input value="${e.role||''}" onchange="data.experience[${i}].role=this.value"></div>
        <div class="field full"><label>DATE RANGE</label><input value="${e.date||''}" onchange="data.experience[${i}].date=this.value"></div>
      </div>
      <div class="highlights-list" id="hl-${i}">${(e.highlights||[]).map((h,j)=>`
        <div class="highlight-row">
          <input value="${h}" onchange="data.experience[${i}].highlights[${j}]=this.value" placeholder="Bullet point">
          <button class="btn-icon" onclick="removeHighlight(${i},${j})">x</button>
        </div>`).join('')}
        <button class="btn-add" style="margin-top:.5rem" onclick="addHighlight(${i})">+ ADD BULLET</button>
      </div>
    </div>`).join('');
  initDrag('experience-list', 'experience');
}
function addExperience() { data.experience.unshift({company:'',role:'',date:'',highlights:[]}); renderExperience(); }
function removeExp(i) { data.experience.splice(i,1); renderExperience(); }
function addHighlight(i) { data.experience[i].highlights.push(''); renderExperience(); }
function removeHighlight(i,j) { data.experience[i].highlights.splice(j,1); renderExperience(); }
function collectExperience() {
  document.querySelectorAll('#experience-list .card').forEach((card,i) => {
    const ins = card.querySelectorAll('.form-grid input');
    if (data.experience[i]) {
      data.experience[i].company = ins[0].value;
      data.experience[i].role    = ins[1].value;
      data.experience[i].date    = ins[2].value;
      data.experience[i].highlights = Array.from(card.querySelectorAll('.highlight-row input')).map(x=>x.value).filter(Boolean);
    }
  });
}

// ============================================================
// PROJECTS
// ============================================================
function renderProjects() {
  document.getElementById('projects-list').innerHTML = (data.projects||[]).map((p,i)=>`
    <div class="card" draggable="true" data-index="${i}" data-type="projects">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:.5rem">
          <span class="drag-handle">::</span>
          <span class="card-title">${p.name||'New Project'}</span>
        </div>
        <button class="btn-remove" onclick="removeProject(${i})">REMOVE</button>
      </div>
      <div class="form-grid">
        <div class="field"><label>NAME</label><input value="${p.name||''}" onchange="data.projects[${i}].name=this.value"></div>
        <div class="field"><label>STARS</label><input type="number" value="${p.stars||0}" onchange="data.projects[${i}].stars=+this.value"></div>
        <div class="field full"><label>DESCRIPTION</label><textarea rows="2" onchange="data.projects[${i}].description=this.value">${p.description||''}</textarea></div>
        <div class="field full"><label>TECH TAGS (comma separated)</label><input value="${(p.tech||[]).join(', ')}" onchange="data.projects[${i}].tech=this.value.split(',').map(t=>t.trim()).filter(Boolean)"></div>
        <div class="field full"><label>GITHUB LINK</label><input type="url" value="${p.link||''}" onchange="data.projects[${i}].link=this.value"></div>
      </div>
    </div>`).join('');
  initDrag('projects-list', 'projects');
}
function addProject() { data.projects.unshift({name:'',description:'',tech:[],stars:0,link:''}); renderProjects(); }
function removeProject(i) { data.projects.splice(i,1); renderProjects(); }

// ============================================================
// SKILLS
// ============================================================
function renderSkills() {
  const entries = Object.entries(data.skills||{});
  document.getElementById('skills-list').innerHTML = entries.map(([cat,list],i)=>`
    <div class="card" draggable="true" data-index="${i}" data-type="skills">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:.5rem">
          <span class="drag-handle">::</span>
          <span class="card-title">${cat}</span>
        </div>
        <button class="btn-remove" onclick="removeSkillCat('${cat}')">REMOVE</button>
      </div>
      <div class="field" style="margin-bottom:.75rem"><label>CATEGORY NAME</label><input value="${cat}" onchange="renameSkillCat('${cat}',this.value)"></div>
      <div class="field"><label>SKILLS (one per line)</label><textarea rows="5" onchange="data.skills['${cat}']=this.value.split('\n').map(s=>s.trim()).filter(Boolean)">${list.join('\n')}</textarea></div>
    </div>`).join('');
  initDrag('skills-list', 'skills');
}
function addSkillCategory() {
  const name = 'NEW CATEGORY';
  data.skills[name] = [];
  renderSkills();
}
function removeSkillCat(cat) { delete data.skills[cat]; renderSkills(); }
function renameSkillCat(oldName, newName) {
  if (oldName === newName) return;
  const val = data.skills[oldName];
  const keys = Object.keys(data.skills);
  const newSkills = {};
  keys.forEach(k => { newSkills[k === oldName ? newName : k] = data.skills[k]; });
  data.skills = newSkills;
  renderSkills();
}

// ============================================================
// CONTACT
// ============================================================
function renderContact() {
  document.getElementById('contact-list').innerHTML = (data.contact||[]).map((c,i)=>`
    <div class="card">
      <div class="card-header"><span class="card-title">${c.label||'New'}</span><button class="btn-remove" onclick="removeContact(${i})">REMOVE</button></div>
      <div class="form-grid">
        <div class="field"><label>LABEL</label><input value="${c.label||''}" onchange="data.contact[${i}].label=this.value"></div>
        <div class="field"><label>VALUE</label><input value="${c.value||''}" onchange="data.contact[${i}].value=this.value"></div>
        <div class="field full"><label>LINK (mailto: or https://)</label><input type="url" value="${c.link||''}" onchange="data.contact[${i}].link=this.value"></div>
      </div>
    </div>`).join('');
}
function addContact() { data.contact.push({label:'',value:'',link:''}); renderContact(); }
function removeContact(i) { data.contact.splice(i,1); renderContact(); }

// ============================================================
// FOOTER
// ============================================================
function renderFooter() {
  v('footer-copyright', data.footer.copyright);
  v('footer-quote', data.footer.quote);
}
function collectFooter() {
  data.footer.copyright = g('footer-copyright');
  data.footer.quote     = g('footer-quote');
}

// ============================================================
// COLLECT ALL
// ============================================================
function collectAll() {
  collectHero(); collectAbout(); collectExperience();
  collectSkills(); collectContact(); collectFooter();
}
function collectSkills() {
  document.querySelectorAll('#skills-list .card').forEach(card => {
    const nameInput = card.querySelector('.field input');
    const textarea  = card.querySelector('textarea');
    if (nameInput && textarea) {
      const cat = nameInput.value.trim();
      if (cat) data.skills[cat] = textarea.value.split('\n').map(s=>s.trim()).filter(Boolean);
    }
  });
}
function collectContact() {
  document.querySelectorAll('#contact-list .card').forEach((card,i) => {
    const ins = card.querySelectorAll('input');
    if (data.contact[i]) { data.contact[i].label=ins[0].value; data.contact[i].value=ins[1].value; data.contact[i].link=ins[2].value; }
  });
}

// ============================================================
// JSON + DOWNLOAD
// ============================================================
function generateJSON() {
  collectAll();
  document.getElementById('json-output').textContent = JSON.stringify(data, null, 2);
  const m = document.getElementById('modal');
  m.style.display = 'flex'; m.classList.add('open');
}
function closeModal(e) {
  if (e.target.id === 'modal') { document.getElementById('modal').style.display='none'; }
}
function copyJSON() {
  navigator.clipboard.writeText(document.getElementById('json-output').textContent)
    .then(()=>setStatus('Copied to clipboard.','ok'));
}
function downloadJSON() {
  collectAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = Object.assign(document.createElement('a'), {href:URL.createObjectURL(blob), download:'data.json'});
  a.click();
}

// ============================================================
// GITHUB API PUSH
// ============================================================
const REPO_OWNER = 'shahil-sk';
const REPO_NAME  = 'shahil-sk.github.io';
const BRANCH     = 'main';

async function ghAPI(path, method, body) {
  const token = ghToken || localStorage.getItem('sk_gh_token');
  if (!token) throw new Error('No GitHub token. Enter your PAT in the sidebar.');
  const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/${path}`, {
    method,
    headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github+json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err.message || `GitHub API error ${res.status}`);
  }
  return res.json();
}

async function getFileSHA(filePath) {
  try {
    const res = await ghAPI(`contents/${filePath}?ref=${BRANCH}`, 'GET');
    return res.sha || null;
  } catch(e) { return null; }
}

async function pushFile(filePath, content, message) {
  const sha = await getFileSHA(filePath);
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: BRANCH
  };
  if (sha) body.sha = sha;
  return ghAPI(`contents/${filePath}`, 'PUT', body);
}

// Push just data.json
async function pushDataJSON() {
  collectAll();
  setStatus('Pushing data.json...', '');
  try {
    await pushFile('data.json', JSON.stringify(data, null, 2), 'chore: update portfolio data via admin');
    setStatus('data.json pushed successfully.', 'ok');
  } catch(e) { setStatus('Error: ' + e.message, 'err'); }
}

// Push everything (data.json + any pending blog changes)
async function pushToGitHub() {
  collectAll();
  setStatus('Pushing...', '');
  try {
    await pushFile('data.json', JSON.stringify(data, null, 2), 'chore: update portfolio data via admin');
    setStatus('Pushed. Site will update in ~60s.', 'ok');
  } catch(e) { setStatus('Error: ' + e.message, 'err'); }
}

function setStatus(msg, type) {
  const el = document.getElementById('push-status');
  el.textContent = msg;
  el.className = 'push-status ' + type;
}

// ============================================================
// DRAG & DROP REORDER
// ============================================================
function initDrag(listId, type) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.querySelectorAll('.card[draggable]').forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.effectAllowed = 'move';
      card.style.opacity = '0.4';
      card._dragIdx = parseInt(card.dataset.index);
      card._dragType = type;
    });
    card.addEventListener('dragend', () => { card.style.opacity = '1'; });
    card.addEventListener('dragover', e => { e.preventDefault(); card.classList.add('drag-over'); });
    card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
    card.addEventListener('drop', e => {
      e.preventDefault();
      card.classList.remove('drag-over');
      const fromIdx = parseInt(list.querySelector('[style*="opacity: 0.4"], [style*="opacity:0.4"]')?.dataset.index ?? '-1');
      const toIdx   = parseInt(card.dataset.index);
      if (fromIdx < 0 || fromIdx === toIdx) return;
      if (type === 'experience') reorder(data.experience, fromIdx, toIdx, renderExperience);
      else if (type === 'projects') reorder(data.projects, fromIdx, toIdx, renderProjects);
      else if (type === 'skills') {
        const keys = Object.keys(data.skills);
        const vals = Object.values(data.skills);
        reorderArr(keys, fromIdx, toIdx);
        reorderArr(vals, fromIdx, toIdx);
        data.skills = {};
        keys.forEach((k,i) => data.skills[k] = vals[i]);
        renderSkills();
      }
    });
  });
}
function reorder(arr, from, to, render) {
  const item = arr.splice(from, 1)[0];
  arr.splice(to, 0, item);
  render();
}
function reorderArr(arr, from, to) {
  const item = arr.splice(from,1)[0];
  arr.splice(to,0,item);
}

// ============================================================
// BLOG EDITOR
// ============================================================
function renderPostList() {
  const el = document.getElementById('post-entries');
  if (!posts.length) { el.innerHTML = '<div class="hint" style="padding:1rem">No posts yet. Click + NEW.</div>'; return; }
  el.innerHTML = posts.map((p,i) => `
    <div class="post-entry" data-index="${i}" onclick="openPost(${i})">
      <div class="post-entry-title">${p.title || 'Untitled'}</div>
      <div class="post-entry-meta">${p.date || ''} &nbsp;·&nbsp; ${(p.tags||[]).join(', ')}</div>
    </div>`).join('');
}

function openPost(index) {
  document.querySelectorAll('.post-entry').forEach(e => e.classList.remove('active'));
  document.querySelector(`.post-entry[data-index="${index}"]`)?.classList.add('active');
  const post = posts[index];
  currentPost = { ...post, _index: index, _isNew: false };
  document.getElementById('post-title').value   = post.title || '';
  document.getElementById('post-slug').value    = post.slug  || '';
  document.getElementById('post-date').value    = post.date  || '';
  document.getElementById('post-tags').value    = (post.tags||[]).join(', ');
  document.getElementById('post-excerpt').value = post.excerpt || '';

  // Load MD file
  fetch(`posts/${post.slug}.md?` + Date.now())
    .then(r => r.ok ? r.text() : '')
    .then(md => {
      // Strip frontmatter for editing
      const body = md.replace(/^---[\s\S]*?---\n?/, '');
      document.getElementById('post-body').value = body;
      renderPreview();
      updateWordCount();
    });
}

function newPost() {
  currentPost = { _isNew: true };
  document.querySelectorAll('.post-entry').forEach(e => e.classList.remove('active'));
  document.getElementById('post-title').value   = '';
  document.getElementById('post-slug').value    = '';
  document.getElementById('post-date').value    = new Date().toISOString().split('T')[0];
  document.getElementById('post-tags').value    = '';
  document.getElementById('post-excerpt').value = '';
  document.getElementById('post-body').value    = '';
  document.getElementById('md-preview').innerHTML = '';
  document.getElementById('editor-info').textContent = '0 words';
}

function discardPost() {
  if (currentPost?._isNew) newPost();
  else if (currentPost?._index !== undefined) openPost(currentPost._index);
}

function autoSlug() {
  const titleEl = document.getElementById('post-title');
  const slugEl  = document.getElementById('post-slug');
  if (!slugEl.value || slugEl.dataset.auto !== 'false') {
    slugEl.value = titleEl.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    slugEl.dataset.auto = 'true';
  }
}

document.getElementById?.('post-slug')?.addEventListener('input', function() {
  this.dataset.auto = 'false';
});

function renderPreview() {
  const md = document.getElementById('post-body').value;
  if (typeof marked !== 'undefined') {
    document.getElementById('md-preview').innerHTML = marked.parse(md);
  }
}

function updateWordCount() {
  const words = document.getElementById('post-body').value.trim().split(/\s+/).filter(Boolean).length;
  const mins  = Math.max(1, Math.round(words / 200));
  document.getElementById('editor-info').textContent = `${words} words  ·  ~${mins} min read`;
}

// Save to localStorage only (no push)
function savePostLocal() {
  const slug = document.getElementById('post-slug').value.trim();
  if (!slug) { alert('Enter a slug first.'); return; }
  const draft = buildPostData();
  localStorage.setItem('draft_' + slug, JSON.stringify(draft));
  setStatus('Draft saved locally.', 'ok');
}

function buildPostData() {
  const title   = document.getElementById('post-title').value.trim();
  const slug    = document.getElementById('post-slug').value.trim();
  const date    = document.getElementById('post-date').value.trim();
  const tags    = document.getElementById('post-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const excerpt = document.getElementById('post-excerpt').value.trim();
  const body    = document.getElementById('post-body').value;
  const frontmatter = `---\ntitle: ${title}\ndate: ${date}\nauthor: Shahil Ahmed\ntags:\n${tags.map(t=>'  - '+t).join('\n')}\n---\n\n`;
  return { title, slug, date, tags, excerpt, fullMd: frontmatter + body };
}

// Publish = push .md file + update posts/index.json
async function publishPost() {
  const token = ghToken || localStorage.getItem('sk_gh_token');
  if (!token) { setStatus('No token. Enter your GitHub PAT.', 'err'); return; }

  const { title, slug, date, tags, excerpt, fullMd } = buildPostData();
  if (!slug || !title) { setStatus('Title and slug are required.', 'err'); return; }

  setStatus('Publishing...', '');
  try {
    // 1. Push the .md file
    await pushFile(`posts/${slug}.md`, fullMd, `post: ${currentPost?._isNew ? 'add' : 'update'} "${title}"`);

    // 2. Update index.json
    const indexEntry = { slug, title, date, excerpt, tags };
    if (currentPost?._isNew) {
      posts.unshift(indexEntry);
    } else {
      const idx = posts.findIndex(p => p.slug === slug);
      if (idx >= 0) posts[idx] = indexEntry;
      else posts.unshift(indexEntry);
    }
    await pushFile('posts/index.json', JSON.stringify(posts, null, 2), `chore: update blog index for "${title}"`);

    setStatus(`Published: ${slug}`, 'ok');
    currentPost = { ...currentPost, _isNew: false, slug };
    renderPostList();
  } catch(e) { setStatus('Error: ' + e.message, 'err'); }
}

// ============================================================
// MARKDOWN TOOLBAR HELPERS
// ============================================================
function mdWrap(before, after) {
  const ta = document.getElementById('post-body');
  const s = ta.selectionStart, e = ta.selectionEnd;
  const selected = ta.value.slice(s, e) || 'text';
  const replacement = before + selected + after;
  ta.setRangeText(replacement, s, e, 'select');
  ta.focus(); renderPreview();
}
function mdBlock(before, after) {
  const ta = document.getElementById('post-body');
  const s = ta.selectionStart, e = ta.selectionEnd;
  const selected = ta.value.slice(s, e) || 'code here';
  ta.setRangeText(before + selected + after, s, e, 'end');
  ta.focus(); renderPreview();
}
function mdHeading(level) {
  const ta = document.getElementById('post-body');
  const s = ta.selectionStart;
  const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
  const prefix = '#'.repeat(level) + ' ';
  ta.setRangeText(prefix, lineStart, lineStart, 'end');
  ta.focus(); renderPreview();
}
function mdLine(prefix) {
  const ta = document.getElementById('post-body');
  const s = ta.selectionStart;
  const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
  ta.setRangeText(prefix, lineStart, lineStart, 'end');
  ta.focus(); renderPreview();
}
function insertHr() {
  const ta = document.getElementById('post-body');
  const s = ta.selectionStart;
  ta.setRangeText('\n\n---\n\n', s, s, 'end');
  ta.focus(); renderPreview();
}
function insertImageHelper() {
  const filename = prompt('Image filename (e.g. screenshot.png)\nPut the file in posts/images/ on GitHub.');
  if (!filename) return;
  const alt = prompt('Alt text / caption:') || '';
  mdLine(`![${alt}](${filename})`);
}

// ============================================================
// UTILS
// ============================================================
function v(id, val) { const el = document.getElementById(id); if (el) { el.tagName==='TEXTAREA' ? el.value=val||'' : el.value=val||''; } }
function g(id)      { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
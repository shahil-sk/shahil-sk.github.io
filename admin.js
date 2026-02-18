// ============================================================
// STATE
// ============================================================
let data = {
  hero:       { logo:'SK', firstName:'SHAHIL', lastName:'AHMED', subtitle:'OFFENSIVE SECURITY / PENETRATION TESTER / RED TEAM', location:'Mangaluru, Karnataka • Available for Projects', videoUrl:'', stats:[] },
  about:      { intro:'', paragraph1:'', paragraph2:'', education:[], certifications:[] },
  experience: [],
  projects:   [],
  skills:     {},
  contact:    [],
  footer:     { copyright:'© 2026 SHAHIL AHMED', quote:'"I don\'t know why i like 1\'s and 0\'s"' }
};

let posts        = [];    // posts/index.json array
let currentPost  = null;  // post currently open in editor
let ghToken      = '';
let previewTimer = null;  // debounce handle

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  ghToken = localStorage.getItem('sk_gh_token') || '';
  if (ghToken) document.getElementById('gh-token').value = '••••••••';

  // Sidebar tab switching
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'blog') loadBlogPosts();
    });
  });

  // Live preview — debounced, body only
  const bodyEl = document.getElementById('post-body');
  if (bodyEl) {
    bodyEl.addEventListener('input', () => {
      updateWordCount();
      clearTimeout(previewTimer);
      previewTimer = setTimeout(renderPreview, 300);
    });
  }

  // Slug auto-gen from title only
  const titleEl = document.getElementById('post-title');
  if (titleEl) titleEl.addEventListener('input', autoSlug);

  // Mark slug as manually edited
  const slugEl = document.getElementById('post-slug');
  if (slugEl) slugEl.addEventListener('input', function() { this.dataset.auto = 'false'; });

  loadData();
});

// ============================================================
// TOKEN
// ============================================================
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
  renderDraftList();
}

// ============================================================
// RENDER ALL SECTIONS
// ============================================================
function renderAll() {
  renderHero(); renderAbout(); renderExperience();
  renderProjects(); renderSkills(); renderContact(); renderFooter();
}

// ============================================================
// HERO
// ============================================================
function renderHero() {
  v('hero-logo',      data.hero.logo);
  v('hero-firstname', data.hero.firstName);
  v('hero-lastname',  data.hero.lastName);
  v('hero-subtitle',  data.hero.subtitle);
  v('hero-location',  data.hero.location);
  v('hero-video',     data.hero.videoUrl);
  renderStats();
}
function collectHero() {
  data.hero.logo      = g('hero-logo');
  data.hero.firstName = g('hero-firstname');
  data.hero.lastName  = g('hero-lastname');
  data.hero.subtitle  = g('hero-subtitle');
  data.hero.location  = g('hero-location');
  data.hero.videoUrl  = g('hero-video');
  collectStats();
}
function renderStats() {
  document.getElementById('stats-list').innerHTML = data.hero.stats.map((s,i) => `
    <div class="card">
      <div class="card-header">
        <span class="card-title">STAT ${i+1}</span>
        <button class="btn-remove" onclick="removeStat(${i})">REMOVE</button>
      </div>
      <div class="form-grid">
        <div class="field"><label>VALUE</label><input value="${esc(s.value)}" onchange="data.hero.stats[${i}].value=this.value"></div>
        <div class="field"><label>LABEL</label><input value="${esc(s.label)}" onchange="data.hero.stats[${i}].label=this.value"></div>
      </div>
    </div>`).join('');
}
function addStat()      { data.hero.stats.push({value:'',label:''}); renderStats(); }
function removeStat(i)  { data.hero.stats.splice(i,1); renderStats(); }
function collectStats() {
  document.querySelectorAll('#stats-list .card').forEach((card,i) => {
    const ins = card.querySelectorAll('input');
    if (data.hero.stats[i]) { data.hero.stats[i].value=ins[0].value; data.hero.stats[i].label=ins[1].value; }
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
      <div class="card-header"><span class="card-title">${esc(e.institution)||'New'}</span>
        <button class="btn-remove" onclick="removeEdu(${i})">REMOVE</button></div>
      <div class="form-grid">
        <div class="field full"><label>DEGREE</label><input value="${esc(e.degree)}" onchange="data.about.education[${i}].degree=this.value"></div>
        <div class="field"><label>INSTITUTION</label><input value="${esc(e.institution)}" onchange="data.about.education[${i}].institution=this.value"></div>
        <div class="field"><label>YEARS</label><input value="${esc(e.years)}" onchange="data.about.education[${i}].years=this.value"></div>
      </div>
    </div>`).join('');
}
function addEducation() { data.about.education.push({degree:'',institution:'',years:''}); renderEducation(); }
function removeEdu(i)   { data.about.education.splice(i,1); renderEducation(); }
function collectEducation() {
  document.querySelectorAll('#education-list .card').forEach((card,i) => {
    const ins = card.querySelectorAll('input');
    if (data.about.education[i]) {
      data.about.education[i].degree=ins[0].value;
      data.about.education[i].institution=ins[1].value;
      data.about.education[i].years=ins[2].value;
    }
  });
}
function renderCerts() {
  document.getElementById('cert-list').innerHTML = (data.about.certifications||[]).map((c,i)=>`
    <div class="card">
      <div class="card-header"><span class="card-title">${esc(c)||'New'}</span>
        <button class="btn-remove" onclick="removeCert(${i})">REMOVE</button></div>
      <div class="field"><label>CERTIFICATION</label><input value="${esc(c)}" onchange="data.about.certifications[${i}]=this.value"></div>
    </div>`).join('');
}
function addCert()     { data.about.certifications.push(''); renderCerts(); }
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
          <span class="card-title">${esc(e.company)||'New'} — ${esc(e.role)||''}</span>
        </div>
        <button class="btn-remove" onclick="removeExp(${i})">REMOVE</button>
      </div>
      <div class="form-grid">
        <div class="field"><label>COMPANY</label><input value="${esc(e.company)}" onchange="data.experience[${i}].company=this.value"></div>
        <div class="field"><label>ROLE</label><input value="${esc(e.role)}" onchange="data.experience[${i}].role=this.value"></div>
        <div class="field full"><label>DATE RANGE</label><input value="${esc(e.date)}" onchange="data.experience[${i}].date=this.value"></div>
      </div>
      <div class="highlights-list">${(e.highlights||[]).map((h,j)=>`
        <div class="highlight-row">
          <input value="${esc(h)}" onchange="data.experience[${i}].highlights[${j}]=this.value" placeholder="Bullet point">
          <button class="btn-icon" onclick="removeHighlight(${i},${j})">x</button>
        </div>`).join('')}
        <button class="btn-add" style="margin-top:.5rem" onclick="addHighlight(${i})">+ ADD BULLET</button>
      </div>
    </div>`).join('');
  initDrag('experience-list','experience');
}
function addExperience()      { data.experience.unshift({company:'',role:'',date:'',highlights:[]}); renderExperience(); }
function removeExp(i)         { data.experience.splice(i,1); renderExperience(); }
function addHighlight(i)      { data.experience[i].highlights.push(''); renderExperience(); }
function removeHighlight(i,j) { data.experience[i].highlights.splice(j,1); renderExperience(); }
function collectExperience() {
  document.querySelectorAll('#experience-list .card').forEach((card,i) => {
    const ins = card.querySelectorAll('.form-grid input');
    if (data.experience[i]) {
      data.experience[i].company    = ins[0].value;
      data.experience[i].role       = ins[1].value;
      data.experience[i].date       = ins[2].value;
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
          <span class="card-title">${esc(p.name)||'New Project'}</span>
        </div>
        <button class="btn-remove" onclick="removeProject(${i})">REMOVE</button>
      </div>
      <div class="form-grid">
        <div class="field"><label>NAME</label><input value="${esc(p.name)}" onchange="data.projects[${i}].name=this.value"></div>
        <div class="field"><label>STARS</label><input type="number" value="${p.stars||0}" onchange="data.projects[${i}].stars=+this.value"></div>
        <div class="field full"><label>DESCRIPTION</label><textarea rows="2" onchange="data.projects[${i}].description=this.value">${esc(p.description)}</textarea></div>
        <div class="field full"><label>TECH TAGS (comma separated)</label><input value="${esc((p.tech||[]).join(', '))}" onchange="data.projects[${i}].tech=this.value.split(',').map(t=>t.trim()).filter(Boolean)"></div>
        <div class="field full"><label>GITHUB LINK</label><input type="url" value="${esc(p.link)}" onchange="data.projects[${i}].link=this.value"></div>
      </div>
    </div>`).join('');
  initDrag('projects-list','projects');
}
function addProject()     { data.projects.unshift({name:'',description:'',tech:[],stars:0,link:''}); renderProjects(); }
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
          <span class="card-title">${esc(cat)}</span>
        </div>
        <button class="btn-remove" onclick="removeSkillCat('${esc(cat)}')">REMOVE</button>
      </div>
      <div class="field" style="margin-bottom:.75rem"><label>CATEGORY NAME</label><input value="${esc(cat)}" onchange="renameSkillCat('${esc(cat)}',this.value)"></div>
      <div class="field"><label>SKILLS (one per line)</label><textarea rows="5" onchange="updateSkillList('${esc(cat)}',this.value)">${esc(list.join('\n'))}</textarea></div>
    </div>`).join('');
  initDrag('skills-list','skills');
}
function addSkillCategory()       { data.skills['NEW CATEGORY'] = []; renderSkills(); }
function removeSkillCat(cat)      { delete data.skills[cat]; renderSkills(); }
function updateSkillList(cat,val) { if (data.skills[cat] !== undefined) data.skills[cat] = val.split('\n').map(s=>s.trim()).filter(Boolean); }
function renameSkillCat(oldName, newName) {
  if (oldName === newName || !newName.trim()) return;
  const keys = Object.keys(data.skills);
  const vals = Object.values(data.skills);
  const ns   = {};
  keys.forEach((k,i) => { ns[k === oldName ? newName : k] = vals[i]; });
  data.skills = ns;
  renderSkills();
}

// ============================================================
// CONTACT
// ============================================================
function renderContact() {
  document.getElementById('contact-list').innerHTML = (data.contact||[]).map((c,i)=>`
    <div class="card">
      <div class="card-header"><span class="card-title">${esc(c.label)||'New'}</span>
        <button class="btn-remove" onclick="removeContact(${i})">REMOVE</button></div>
      <div class="form-grid">
        <div class="field"><label>LABEL</label><input value="${esc(c.label)}" onchange="data.contact[${i}].label=this.value"></div>
        <div class="field"><label>VALUE</label><input value="${esc(c.value)}" onchange="data.contact[${i}].value=this.value"></div>
        <div class="field full"><label>LINK (mailto: or https://)</label><input type="url" value="${esc(c.link)}" onchange="data.contact[${i}].link=this.value"></div>
      </div>
    </div>`).join('');
}
function addContact()     { data.contact.push({label:'',value:'',link:''}); renderContact(); }
function removeContact(i) { data.contact.splice(i,1); renderContact(); }

// ============================================================
// FOOTER
// ============================================================
function renderFooter()  { v('footer-copyright', data.footer.copyright); v('footer-quote', data.footer.quote); }
function collectFooter() { data.footer.copyright = g('footer-copyright'); data.footer.quote = g('footer-quote'); }

// ============================================================
// COLLECT ALL
// ============================================================
function collectAll() {
  collectHero(); collectAbout(); collectExperience();
  collectSkillsFromDOM(); collectContact(); collectFooter();
}
function collectSkillsFromDOM() {
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
// JSON MODAL + DOWNLOAD
// ============================================================
function generateJSON() {
  collectAll();
  document.getElementById('json-output').textContent = JSON.stringify(data, null, 2);
  const m = document.getElementById('modal');
  m.style.display = 'flex'; m.classList.add('open');
}
function closeModal(e) {
  if (e.target.id === 'modal') document.getElementById('modal').style.display = 'none';
}
function copyJSON() {
  navigator.clipboard.writeText(document.getElementById('json-output').textContent)
    .then(() => setStatus('Copied.', 'ok'));
}
function downloadJSON() {
  collectAll();
  dlFile('data.json', JSON.stringify(data, null, 2), 'application/json');
}

// ============================================================
// GITHUB API
// ============================================================
const REPO_OWNER = 'shahil-sk';
const REPO_NAME  = 'shahil-sk.github.io';
const BRANCH     = 'main';

async function ghAPI(path, method, body) {
  const token = ghToken || localStorage.getItem('sk_gh_token');
  if (!token) throw new Error('No GitHub token. Paste your PAT in the sidebar.');
  const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/${path}`, {
    method,
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type':  'application/json',
      'Accept':        'application/vnd.github+json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err.message || `GitHub API ${res.status}`);
  }
  return res.json();
}

async function getFileSHA(filePath) {
  try   { const r = await ghAPI(`contents/${filePath}?ref=${BRANCH}`, 'GET'); return r.sha || null; }
  catch { return null; }
}

async function pushFile(filePath, content, message) {
  const sha  = await getFileSHA(filePath);
  const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch: BRANCH };
  if (sha) body.sha = sha;
  return ghAPI(`contents/${filePath}`, 'PUT', body);
}

async function pushDataJSON() {
  collectAll();
  setStatus('Pushing data.json…', '');
  try {
    await pushFile('data.json', JSON.stringify(data, null, 2), 'chore: update portfolio data via admin');
    setStatus('data.json pushed.', 'ok');
  } catch(e) { setStatus('Error: ' + e.message, 'err'); }
}

async function pushToGitHub() {
  collectAll();
  setStatus('Pushing…', '');
  try {
    await pushFile('data.json', JSON.stringify(data, null, 2), 'chore: update portfolio data via admin');
    setStatus('Pushed. Site updates in ~60s.', 'ok');
  } catch(e) { setStatus('Error: ' + e.message, 'err'); }
}

function setStatus(msg, type) {
  const el = document.getElementById('push-status');
  el.textContent = msg;
  el.className   = 'push-status ' + type;
}

// ============================================================
// REBUILD INDEX FROM REPO
// Scans posts/ folder on GitHub, reads each .md frontmatter,
// rebuilds posts/index.json and pushes it.
// ============================================================
async function rebuildIndex() {
  const token = ghToken || localStorage.getItem('sk_gh_token');
  if (!token) { setStatus('No token for rebuild.', 'err'); return; }
  setStatus('Scanning posts/ folder…', '');
  try {
    // List all files in posts/ directory
    const dir = await ghAPI('contents/posts?ref=' + BRANCH, 'GET');
    const mdFiles = dir.filter(f => f.type === 'file' && f.name.endsWith('.md'));

    setStatus(`Reading ${mdFiles.length} post(s)…`, '');

    const entries = [];
    for (const file of mdFiles) {
      const slug = file.name.replace(/\.md$/, '');
      try {
        // Fetch file content (base64 encoded)
        const res  = await ghAPI('contents/posts/' + file.name + '?ref=' + BRANCH, 'GET');
        const raw  = decodeURIComponent(escape(atob(res.content.replace(/\n/g,''))));
        const { frontmatter } = parseMdFrontmatter(raw);
        entries.push({
          slug,
          title:   frontmatter.title   || slug,
          date:    frontmatter.date    || '',
          excerpt: frontmatter.excerpt || '',
          tags:    frontmatter.tags    || []
        });
      } catch(e) {
        console.warn('Could not read', file.name, e);
      }
    }

    // Sort newest first by date
    entries.sort((a,b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

    await pushFile('posts/index.json', JSON.stringify(entries, null, 2), 'chore: rebuild blog index from md files');
    posts = entries;
    renderPostList();
    setStatus('Index rebuilt: ' + entries.length + ' posts.', 'ok');
  } catch(e) {
    setStatus('Rebuild failed: ' + e.message, 'err');
  }
}

// ============================================================
// DRAG & DROP
// ============================================================
let _dragFrom = -1;

function initDrag(listId, type) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.querySelectorAll('.card[draggable]').forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.effectAllowed = 'move';
      _dragFrom = parseInt(card.dataset.index);
      card.style.opacity = '0.4';
    });
    card.addEventListener('dragend',  () => { card.style.opacity = '1'; });
    card.addEventListener('dragover',  e => { e.preventDefault(); card.classList.add('drag-over'); });
    card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
    card.addEventListener('drop', e => {
      e.preventDefault();
      card.classList.remove('drag-over');
      const toIdx = parseInt(card.dataset.index);
      if (_dragFrom < 0 || _dragFrom === toIdx) return;
      if      (type === 'experience') reorderArr(data.experience, _dragFrom, toIdx, renderExperience);
      else if (type === 'projects')   reorderArr(data.projects,   _dragFrom, toIdx, renderProjects);
      else if (type === 'skills') {
        const keys = Object.keys(data.skills);
        const vals = Object.values(data.skills);
        reorderArr(keys, _dragFrom, toIdx);
        reorderArr(vals, _dragFrom, toIdx);
        data.skills = {};
        keys.forEach((k,i) => data.skills[k] = vals[i]);
        renderSkills();
      }
      _dragFrom = -1;
    });
  });
}
function reorderArr(arr, from, to, cb) {
  const item = arr.splice(from, 1)[0];
  arr.splice(to, 0, item);
  if (cb) cb();
}

// ============================================================
// BLOG EDITOR — POST LIST
// ============================================================
function renderPostList() {
  const el = document.getElementById('post-entries');
  if (!posts.length) {
    el.innerHTML = '<div class="hint" style="padding:1rem 1rem 0.5rem">No published posts yet.</div>';
    return;
  }
  el.innerHTML = posts.map((p,i) => `
    <div class="post-entry" data-index="${i}" onclick="openPost(${i})">
      <div class="post-entry-title">${esc(p.title)||'Untitled'}</div>
      <div class="post-entry-meta">${p.date||''} &nbsp;·&nbsp; ${(p.tags||[]).join(', ')}</div>
    </div>`).join('');
}

function renderDraftList() {
  const el = document.getElementById('draft-entries');
  if (!el) return;
  const keys = Object.keys(localStorage).filter(k => k.startsWith('draft_'));
  if (!keys.length) { el.innerHTML = ''; return; }
  el.innerHTML = keys.map(k => {
    let title = k.replace('draft_','');
    try { title = JSON.parse(localStorage.getItem(k)).title || title; } catch{}
    return `<div class="draft-entry" onclick="loadDraft('${k}')">
      <span class="draft-entry-title">${esc(title)}</span>
      <button class="draft-del" onclick="deleteDraft(event,'${k}')">x</button>
    </div>`;
  }).join('');
}

function loadDraft(key) {
  try {
    const d = JSON.parse(localStorage.getItem(key));
    if (!d) return;
    currentPost = { _isNew: true };
    document.getElementById('post-title').value   = d.title   || '';
    document.getElementById('post-slug').value    = d.slug    || '';
    document.getElementById('post-date').value    = d.date    || '';
    document.getElementById('post-tags').value    = (d.tags||[]).join(', ');
    document.getElementById('post-excerpt').value = d.excerpt || '';
    const body = (d.fullMd || '').replace(/^---[\s\S]*?---\n?/, '');
    document.getElementById('post-body').value = body;
    renderPreview();
    updateWordCount();
    blogToast('Draft loaded.', 'ok');
  } catch(e) { blogToast('Could not load draft.', 'err'); }
}

function deleteDraft(e, key) {
  e.stopPropagation();
  localStorage.removeItem(key);
  renderDraftList();
  blogToast('Draft deleted.', 'ok');
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
  fetch('posts/' + post.slug + '.md?' + Date.now())
    .then(r => r.ok ? r.text() : '')
    .then(md => {
      document.getElementById('post-body').value = md.replace(/^---[\s\S]*?---\n?/, '');
      renderPreview();
      updateWordCount();
    })
    .catch(() => blogToast('Could not load post file.', 'err'));
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
  const slugEl = document.getElementById('post-slug');
  if (slugEl) slugEl.dataset.auto = 'true';
}

function discardPost() {
  if (currentPost?._isNew)              newPost();
  else if (currentPost?._index != null) openPost(currentPost._index);
}

// ============================================================
// BLOG EDITOR — SLUG / PREVIEW / WORD COUNT
// ============================================================
function autoSlug() {
  const slugEl = document.getElementById('post-slug');
  if (!slugEl || slugEl.dataset.auto === 'false') return;
  slugEl.value = document.getElementById('post-title').value
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function renderPreview() {
  const md      = document.getElementById('post-body')?.value || '';
  const preview = document.getElementById('md-preview');
  if (!preview) return;
  if (typeof marked !== 'undefined') preview.innerHTML = marked.parse(md);
}

function updateWordCount() {
  const words = (document.getElementById('post-body')?.value||'').trim().split(/\s+/).filter(Boolean).length;
  const mins  = Math.max(1, Math.round(words / 200));
  const el    = document.getElementById('editor-info');
  if (el) el.textContent = words + ' words  ·  ~' + mins + ' min read';
}

// ============================================================
// BLOG EDITOR — SAVE LOCALLY (downloads files to your machine)
// ============================================================
function savePostLocal() {
  const slug = document.getElementById('post-slug').value.trim();
  if (!slug) { blogToast('Enter a slug first.', 'err'); return; }

  const { title, date, tags, excerpt, fullMd } = buildPostData();

  // 1. Download the .md file — browser saves it, you move it into posts/
  dlFile(slug + '.md', fullMd, 'text/markdown');

  // 2. Update in-memory posts index and download updated index.json too
  const entry = { slug, title, date, excerpt, tags };
  const idx   = posts.findIndex(p => p.slug === slug);
  if (idx >= 0) posts[idx] = entry;
  else          posts.unshift(entry);

  // Small delay so browser doesn’t block two simultaneous downloads
  setTimeout(() => dlFile('index.json', JSON.stringify(posts, null, 2), 'application/json'), 400);

  // Also persist as localStorage draft so you can reload it
  try {
    localStorage.setItem('draft_' + slug, JSON.stringify(buildPostData()));
    renderDraftList();
  } catch(e) {}

  blogToast('Downloaded: ' + slug + '.md + index.json', 'ok');
}

// ============================================================
// BLOG EDITOR — PUBLISH TO GITHUB
// ============================================================
function buildPostData() {
  const title   = document.getElementById('post-title').value.trim();
  const slug    = document.getElementById('post-slug').value.trim();
  const date    = document.getElementById('post-date').value.trim();
  const tags    = document.getElementById('post-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const excerpt = document.getElementById('post-excerpt').value.trim();
  const body    = document.getElementById('post-body').value;
  const fm      = '---\ntitle: ' + title + '\ndate: ' + date + '\nauthor: Shahil Ahmed\ntags:\n' +
                  tags.map(t => '  - ' + t).join('\n') + '\n---\n\n';
  return { title, slug, date, tags, excerpt, fullMd: fm + body };
}

async function publishPost() {
  const token = ghToken || localStorage.getItem('sk_gh_token');
  if (!token) { blogToast('No GitHub token set.', 'err'); return; }

  const { title, slug, date, tags, excerpt, fullMd } = buildPostData();
  if (!slug || !title) { blogToast('Title and slug required.', 'err'); return; }

  blogToast('Publishing…', '');
  try {
    // Push .md file
    await pushFile('posts/' + slug + '.md', fullMd,
      'post: ' + (currentPost?._isNew ? 'add' : 'update') + ' "' + title + '"');

    // Update index
    const entry = { slug, title, date, excerpt, tags };
    const idx   = posts.findIndex(p => p.slug === slug);
    if (idx >= 0) posts[idx] = entry;
    else          posts.unshift(entry);

    await pushFile('posts/index.json', JSON.stringify(posts, null, 2),
      'chore: update blog index for "' + title + '"');

    localStorage.removeItem('draft_' + slug);
    renderDraftList();
    renderPostList();
    blogToast('Published: ' + slug, 'ok');
    currentPost = { ...currentPost, _isNew: false, slug };
  } catch(e) {
    blogToast('Error: ' + e.message, 'err');
  }
}

// ============================================================
// BLOG TOAST
// ============================================================
let _toastTimer = null;
function blogToast(msg, type) {
  let el = document.getElementById('blog-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'blog-toast';
    el.className = 'blog-toast';
    document.querySelector('.blog-editor-panel')?.appendChild(el);
  }
  el.textContent = msg;
  el.className   = 'blog-toast ' + type + ' show';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ============================================================
// MARKDOWN TOOLBAR
// ============================================================
function mdWrap(before, after) {
  const ta = document.getElementById('post-body');
  const s  = ta.selectionStart, e = ta.selectionEnd;
  ta.setRangeText(before + (ta.value.slice(s,e)||'text') + after, s, e, 'select');
  ta.focus(); clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 300);
}
function mdBlock(before, after) {
  const ta = document.getElementById('post-body');
  const s  = ta.selectionStart, e = ta.selectionEnd;
  ta.setRangeText(before + (ta.value.slice(s,e)||'code here') + after, s, e, 'end');
  ta.focus(); clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 300);
}
function mdHeading(level) {
  const ta    = document.getElementById('post-body');
  const s     = ta.selectionStart;
  const start = ta.value.lastIndexOf('\n', s-1) + 1;
  ta.setRangeText('#'.repeat(level) + ' ', start, start, 'end');
  ta.focus(); clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 300);
}
function mdLine(prefix) {
  const ta    = document.getElementById('post-body');
  const s     = ta.selectionStart;
  const start = ta.value.lastIndexOf('\n', s-1) + 1;
  ta.setRangeText(prefix, start, start, 'end');
  ta.focus(); clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 300);
}
function insertHr() {
  const ta = document.getElementById('post-body');
  const s  = ta.selectionStart;
  ta.setRangeText('\n\n---\n\n', s, s, 'end');
  ta.focus(); clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 300);
}
function insertImageHelper() {
  const filename = prompt('Image filename (e.g. screenshot.png)\nUpload the file to posts/images/ on GitHub.');
  if (!filename) return;
  const alt = prompt('Alt text / caption:') || '';
  mdLine('![' + alt + '](' + filename + ')');
}

// ============================================================
// UTILS
// ============================================================
function v(id, val) { const el = document.getElementById(id); if (el) el.value = val||''; }
function g(id)      { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function esc(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Generic file download helper
function dlFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Frontmatter parser used by rebuildIndex (CRLF-safe)
function parseMdFrontmatter(raw) {
  const text = raw.replace(/\r\n/g,'\n').replace(/\r/g,'\n').trim();
  if (!text.startsWith('---')) return { frontmatter:{}, body:text };
  const closeIdx = text.indexOf('\n---', 3);
  if (closeIdx === -1) return { frontmatter:{}, body:text };
  const fmBlock = text.slice(3, closeIdx).trim();
  const body    = text.slice(closeIdx + 4).replace(/^\n+/, '');
  const fm      = {};
  let curKey    = null;
  const tagLines = [];
  fmBlock.split('\n').forEach(line => {
    if (curKey === 'tags' && /^\s+-\s+/.test(line)) {
      tagLines.push(line.replace(/^\s+-\s+/,'').trim());
      return;
    }
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) { curKey = kv[1]; fm[kv[1]] = kv[2].trim(); }
  });
  if (tagLines.length) fm.tags = tagLines;
  else if (fm.tags)    fm.tags = fm.tags.split(',').map(t=>t.trim()).filter(Boolean);
  else                 fm.tags = [];
  return { frontmatter: fm, body };
}

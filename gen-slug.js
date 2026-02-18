#!/usr/bin/env node
/**
 * gen-slug.js
 * -----------
 * Scans every .md file in posts/, reads frontmatter,
 * generates a clean slug, renames the file to <slug>.md,
 * and writes/updates posts/index.json.
 *
 * Usage:
 *   node gen-slug.js                     ← dry run  (no files changed)
 *   node gen-slug.js --apply             ← rename files + write index.json
 *   node gen-slug.js --apply --clean-title  ← also strips .md from title field
 */

const fs   = require('fs');
const path = require('path');

const POSTS_DIR    = path.join(__dirname, 'posts');
const INDEX_FILE   = path.join(POSTS_DIR, 'index.json');
const APPLY        = process.argv.includes('--apply');
const CLEAN_TITLE  = process.argv.includes('--clean-title');

// ────────────────────────────────────────────────────────────────
// Slug generator
// ────────────────────────────────────────────────────────────────
function makeSlug(title) {
  return title
    .toLowerCase()
    .replace(/\.md$/i, '')           // strip accidental .md suffix
    .replace(/[^a-z0-9\s-]/g, '')   // drop special chars
    .trim()
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse consecutive hyphens
    .replace(/^-|-$/g, '');          // trim edge hyphens
}

// ────────────────────────────────────────────────────────────────
// Full frontmatter parser — returns title, date, author, tags, excerpt
// ────────────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const empty = { title: null, date: '', author: '', tags: [], excerpt: '', lines: [], titleLineIdx: -1, rest: text };
  if (!text.startsWith('---')) return empty;

  const closeIdx = text.indexOf('\n---', 3);
  if (closeIdx === -1) return empty;

  const fmBlock = text.slice(3, closeIdx);
  const rest    = text.slice(closeIdx + 4);
  const lines   = fmBlock.split('\n');

  const fm = { title: null, date: '', author: '', tags: [], excerpt: '' };
  let curKey   = null;
  let titleIdx = -1;
  const tagLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // YAML list item under tags:
    if (curKey === 'tags' && /^\s+-\s+/.test(line)) {
      tagLines.push(line.replace(/^\s+-\s+/, '').trim());
      continue;
    }

    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) {
      curKey = kv[1];
      const val = kv[2].trim().replace(/^['"]|['"]$/g, '');
      fm[kv[1]] = val;
      if (kv[1] === 'title') titleIdx = i;
    }
  }

  // Resolve tags
  if (tagLines.length)    fm.tags = tagLines;
  else if (fm.tags)       fm.tags = String(fm.tags).split(',').map(t => t.trim()).filter(Boolean);
  else                    fm.tags = [];

  return {
    title:        fm.title  || null,
    date:         fm.date   || '',
    author:       fm.author || '',
    tags:         fm.tags,
    excerpt:      fm.excerpt || '',
    lines,
    titleLineIdx: titleIdx,
    rest
  };
}

// ────────────────────────────────────────────────────────────────
// Rebuild raw file content (optionally strip .md from title line)
// ────────────────────────────────────────────────────────────────
function rebuildFile(parsed) {
  const lines = [...parsed.lines];
  if (CLEAN_TITLE && parsed.titleLineIdx !== -1) {
    lines[parsed.titleLineIdx] = lines[parsed.titleLineIdx].replace(/\.md(['"]?\s*)$/i, '$1');
  }
  return '---\n' + lines.join('\n') + '\n---' + parsed.rest;
}

// ────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────
const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

if (!files.length) {
  console.log('No .md files found in posts/');
  process.exit(0);
}

console.log(`\n${ APPLY ? '🟢 APPLYING' : '🔵 DRY RUN  (pass --apply to write changes)' }\n`);

let renamed  = 0;
let skipped  = 0;
const index  = [];   // will become index.json

for (const file of files) {
  const filePath = path.join(POSTS_DIR, file);
  const raw      = fs.readFileSync(filePath, 'utf8');
  const parsed   = parseFrontmatter(raw);

  if (!parsed.title) {
    console.log(`  ⚠️  SKIP    ${file}  ← no title in frontmatter`);
    skipped++;
    continue;
  }

  const slug    = makeSlug(parsed.title);
  const newName = slug + '.md';
  const newPath = path.join(POSTS_DIR, newName);

  // Clean title for the index (strip .md suffix if present)
  const cleanTitle = parsed.title.replace(/\.md$/i, '').trim();

  if (newName !== file) {
    console.log(`  →  RENAME  ${file}`);
    console.log(`          └─> ${newName}`);
    if (APPLY) {
      fs.writeFileSync(newPath, rebuildFile(parsed), 'utf8');
      if (newPath !== filePath) fs.unlinkSync(filePath);
    }
    renamed++;
  } else {
    console.log(`  ✔️  OK      ${file}`);
  }

  index.push({
    slug,
    title:   cleanTitle,
    date:    parsed.date,
    excerpt: parsed.excerpt,
    tags:    parsed.tags
  });
}

// Sort newest-first by date
index.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

// ── Write index.json ────────────────────────────────────────────
const indexJson = JSON.stringify(index, null, 2);

if (APPLY) {
  fs.writeFileSync(INDEX_FILE, indexJson, 'utf8');
  console.log(`\n  📄 Written  posts/index.json  (${index.length} entries)`);
} else {
  console.log('\n  📄 index.json PREVIEW (not written in dry run):');
  console.log('  ' + indexJson.split('\n').join('\n  '));
}

// ── Summary ─────────────────────────────────────────────────────
console.log(`\nDone.  ${renamed} renamed,  ${skipped} skipped,  ${index.length} indexed.\n`);
if (!APPLY) console.log('  → Run with --apply to apply all changes.\n');

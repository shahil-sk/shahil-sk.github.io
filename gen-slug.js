#!/usr/bin/env node
/**
 * gen-slug.js
 * -----------
 * Scans every .md file in /posts, reads its frontmatter title,
 * generates a clean slug from it, and renames the file to <slug>.md
 *
 * Usage:
 *   node gen-slug.js              ← dry run (shows what would change)
 *   node gen-slug.js --apply      ← actually renames the files
 *   node gen-slug.js --apply --clean-title  ← also strips .md extension
 *                                            from the title field in frontmatter
 */

const fs   = require('fs');
const path = require('path');

const POSTS_DIR   = path.join(__dirname, 'posts');
const APPLY       = process.argv.includes('--apply');
const CLEAN_TITLE = process.argv.includes('--clean-title');

// ────────────────────────────────────────────────────────────────
function makeSlug(title) {
  return title
    .toLowerCase()
    .replace(/\.md$/i, '')          // strip accidental .md in title
    .replace(/[^a-z0-9\s-]/g, '')  // remove special chars (dots, commas, etc.)
    .trim()
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
}

// ────────────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!text.startsWith('---')) return { title: null, raw };

  const closeIdx = text.indexOf('\n---', 3);
  if (closeIdx === -1) return { title: null, raw };

  const fmBlock = text.slice(3, closeIdx);
  const rest    = text.slice(closeIdx + 4);

  let title = null;
  const lines = fmBlock.split('\n');
  const titleLineIdx = lines.findIndex(l => /^title:\s*/.test(l));

  if (titleLineIdx !== -1) {
    title = lines[titleLineIdx].replace(/^title:\s*/, '').trim()
      .replace(/^['"]|['"]$/g, ''); // strip optional quotes
  }

  return { title, fmBlock, rest, lines, titleLineIdx };
}

// ────────────────────────────────────────────────────────────────
function rebuildFile(parsed, cleanTitle) {
  const { lines, titleLineIdx, rest } = parsed;
  if (CLEAN_TITLE && titleLineIdx !== -1) {
    // Remove .md extension from the title value in frontmatter
    lines[titleLineIdx] = lines[titleLineIdx].replace(/\.md(?=['"]?\s*$)/i, '');
  }
  return '---\n' + lines.join('\n') + '\n---' + rest;
}

// ────────────────────────────────────────────────────────────────
const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

if (!files.length) {
  console.log('No .md files found in posts/');
  process.exit(0);
}

console.log(`\n${ APPLY ? '🟢 APPLYING' : '🔵 DRY RUN (pass --apply to rename)' }\n`);

let changed = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(POSTS_DIR, file);
  const raw      = fs.readFileSync(filePath, 'utf8');
  const parsed   = parseFrontmatter(raw);

  if (!parsed.title) {
    console.log(`  ⚠️  SKIP  ${file}  ← no title in frontmatter`);
    skipped++;
    continue;
  }

  const slug    = makeSlug(parsed.title);
  const newName = slug + '.md';

  if (newName === file) {
    console.log(`  ✔️  OK    ${file}`);
    continue;
  }

  console.log(`  →  RENAME  ${file}`);
  console.log(`          └─> ${newName}`);

  if (APPLY) {
    const newPath    = path.join(POSTS_DIR, newName);
    const newContent = rebuildFile(parsed);
    fs.writeFileSync(newPath, newContent, 'utf8');
    if (newPath !== filePath) fs.unlinkSync(filePath);
  }

  changed++;
}

console.log(`\nDone. ${changed} file(s) would be renamed, ${skipped} skipped.`);
if (!APPLY && changed > 0) {
  console.log('Run with --apply to rename them.\n');
}

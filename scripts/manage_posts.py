import os
import json
import argparse
import datetime
import re
import shutil

# Directories
BASE_DIR = os.getcwd()
POSTS_OUTPUT_DIR = os.path.join(BASE_DIR, 'posts')      # Where HTML files go
CONTENT_DIR = os.path.join(BASE_DIR, 'content', 'posts') # Where MD files live
IMAGES_SRC_DIR = os.path.join(BASE_DIR, 'content', 'images')
IMAGES_DST_DIR = os.path.join(POSTS_OUTPUT_DIR, 'images')

INDEX_FILE = os.path.join(POSTS_OUTPUT_DIR, 'index.json')
TEMPLATE_FILE = os.path.join(BASE_DIR, 'blog-post.html')
SITEMAP_FILE = os.path.join(BASE_DIR, 'sitemap.xml')
BASE_URL = 'https://shahil-sk.github.io'

try:
    import markdown
    HAS_MARKDOWN = True
except ImportError:
    HAS_MARKDOWN = False

def migrate_content():
    """
    Moves any .md files found in posts/ to content/posts/
    to separate source code from generated output.
    """
    if not os.path.exists(CONTENT_DIR):
        os.makedirs(CONTENT_DIR)
        print(f"Created directory: {CONTENT_DIR}")

    # Find .md files in the output directory (legacy location)
    if os.path.exists(POSTS_OUTPUT_DIR):
        files = [f for f in os.listdir(POSTS_OUTPUT_DIR) if f.endswith('.md')]
        for filename in files:
            src = os.path.join(POSTS_OUTPUT_DIR, filename)
            dst = os.path.join(CONTENT_DIR, filename)
            
            # Move file
            shutil.move(src, dst)
            print(f"Migrated {filename} to {CONTENT_DIR}")

def copy_images():
    """
    Copies the images directory from content/posts/images to posts/images
    so they are served correctly relative to the static HTML files.
    """
    if os.path.exists(IMAGES_SRC_DIR):
        if os.path.exists(IMAGES_DST_DIR):
            shutil.rmtree(IMAGES_DST_DIR) # Clean old images
        
        shutil.copytree(IMAGES_SRC_DIR, IMAGES_DST_DIR)
        print(f"Copied images from {IMAGES_SRC_DIR} to {IMAGES_DST_DIR}")
    else:
        print(f"No images directory found at {IMAGES_SRC_DIR}")

def fix_image_links(content):
    """
    Converts Obsidian-style links ![[image.png]] to standard Markdown ![image.png](images/image.png)
    """
    # Regex for ![[filename.png]] -> ![filename.png](images/filename.png)
    # This handles common image extensions
    pattern = r'!\[\[(.*?)\]\]'
    
    def replace_link(match):
        filename = match.group(1)
        # Check if it looks like an image
        if any(filename.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']):
            return f'![{filename}](images/{filename})'
        return match.group(0) # Return original if not an image (or logic could be extended)

    return re.sub(pattern, replace_link, content)

def parse_frontmatter(content):
    content = content.replace('\r\n', '\n').strip()
    if not content.startswith('---'):
        return {}, content
    try:
        end_idx = content.index('\n---', 3)
        fm_text = content[3:end_idx].strip()
        body = content[end_idx+4:].strip()
        metadata = {}
        current_key = None
        for line in fm_text.split('\n'):
            line = line.strip()
            if not line: continue
            if line.startswith('- ') and current_key == 'tags':
                if 'tags' not in metadata: metadata['tags'] = []
                metadata['tags'].append(line[2:].strip())
                continue
            if ':' in line:
                key, val = line.split(':', 1)
                key = key.strip()
                val = val.strip()
                if key == 'tags':
                    current_key = 'tags'
                    if val and val.startswith('[') and val.endswith(']'):
                        val = val[1:-1]
                        metadata['tags'] = [x.strip() for x in val.split(',') if x.strip()]
                    elif not val:
                        metadata['tags'] = []
                    else:
                        metadata['tags'] = [x.strip() for x in val.split(',') if x.strip()]
                else:
                    current_key = key
                    metadata[key] = val
        return metadata, body
    except ValueError:
        return {}, content

def build_blog():
    # 1. Migrate any legacy files first
    migrate_content()
    
    # 2. Copy images
    copy_images()
    
    print(f"Scanning {CONTENT_DIR}...")
    posts = []
    
    if not os.path.exists(CONTENT_DIR):
        os.makedirs(CONTENT_DIR)
        
    if not os.path.exists(POSTS_OUTPUT_DIR):
        os.makedirs(POSTS_OUTPUT_DIR)

    files = [f for f in os.listdir(CONTENT_DIR) if f.endswith('.md')]
    template = ""
    if os.path.exists(TEMPLATE_FILE):
        with open(TEMPLATE_FILE, 'r', encoding='utf-8') as f:
            template = f.read()
    else:
        print(f"Warning: Template file {TEMPLATE_FILE} not found.")

    for filename in files:
        filepath = os.path.join(CONTENT_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        fm, body = parse_frontmatter(content)
        if not fm.get('title'):
            print(f"Warning: Skipping {filename} (no title)")
            continue
            
        slug = filename.replace('.md', '')
        word_count = len(body.split())
        read_time = max(1, round(word_count / 200))
        read_time_str = f"{read_time} min read"

        # Transform Obsidian links before Markdown processing
        body = fix_image_links(body)

        # Generate HTML
        if HAS_MARKDOWN and template:
            html_content = markdown.markdown(body, extensions=['fenced_code', 'tables'])
            page_html = template

            # Cleanups
            page_html = page_html.replace('<script src="post.js"></script>', '')
            
            # Paths
            page_html = page_html.replace('href="styles.css"', 'href="../styles.css"')
            page_html = page_html.replace('href="post.css"', 'href="../post.css"')
            page_html = page_html.replace('src="script.js"', 'src="../script.js"')
            page_html = page_html.replace('href="index.html"', 'href="../index.html"')
            page_html = page_html.replace('href="blog.html"', 'href="../blog.html"')
            page_html = page_html.replace('href="blog-post.html"', 'href="../blog-post.html"')
            page_html = page_html.replace('href="/"', 'href="../index.html"')
            page_html = page_html.replace('href="/#', 'href="../index.html#')

            # Content Injection
            title = fm.get('title', 'Untitled')
            page_html = page_html.replace('<title>Post — Shahil Ahmed</title>', f'<title>{title} — Shahil Ahmed</title>')
            page_html = page_html.replace('<h1 class="post-title" id="post-title">Loading...</h1>', f'<h1 class="post-title" id="post-title">{title}</h1>')
            date = fm.get('date', '')
            page_html = page_html.replace('<div class="post-meta" id="post-meta"></div>', f'<div class="post-meta" id="post-meta">{date}</div>')
            tags_html = "".join([f'<span class="blog-tag">{t}</span>' for t in fm.get('tags', [])])
            page_html = page_html.replace('<div class="post-tags" id="post-tags"></div>', f'<div class="post-tags" id="post-tags">{tags_html}</div>')
            page_html = page_html.replace('<div class="post-reading-time" id="post-reading-time"></div>', f'<div class="post-reading-time" id="post-reading-time">{read_time_str}</div>')
            page_html = page_html.replace('<article class="post-body" id="post-body"></article>', f'<article class="post-body" id="post-body">{html_content}</article>')
            
            # SEO Meta
            meta_desc = fm.get('excerpt', body[:150].replace('\n', ' '))
            meta_tags = f'''
    <meta name="description" content="{meta_desc}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{meta_desc}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{BASE_URL}/posts/{slug}.html">
            '''
            page_html = page_html.replace('</head>', f'{meta_tags}\n</head>')

            out_path = os.path.join(POSTS_OUTPUT_DIR, f"{slug}.html")
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(page_html)
            print(f"Generated: {out_path}")
        
        post_data = {
            'slug': slug,
            'title': fm.get('title', 'Untitled'),
            'date': fm.get('date', ''),
            'excerpt': fm.get('excerpt', body[:150] + '...'),
            'tags': fm.get('tags', []),
            'readTime': read_time_str,
            'url': f"posts/{slug}.html"
        }
        posts.append(post_data)
        
    posts.sort(key=lambda x: x['date'], reverse=True)
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2)
    print(f"Indexed {len(posts)} posts.")
    generate_sitemap(posts)

def generate_sitemap(posts):
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for page in ['', 'index.html', 'blog.html']:
        xml.append(f'  <url><loc>{BASE_URL}/{page}</loc><changefreq>weekly</changefreq></url>')
    for p in posts:
        xml.append(f'  <url><loc>{BASE_URL}/posts/{p["slug"]}.html</loc><lastmod>{p["date"]}</lastmod></url>')
    xml.append('</urlset>')
    with open(SITEMAP_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml))

def new_post(title):
    slug = title.lower().replace(' ', '-')
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    today = datetime.date.today().isoformat()
    content = f"""---
title: {title}
date: {today}
author: Shahil Ahmed
excerpt: Short description...
tags:
  - Tech
---

Write your content here...
"""
    # Ensure dir exists
    if not os.path.exists(CONTENT_DIR):
        os.makedirs(CONTENT_DIR)
        
    filepath = os.path.join(CONTENT_DIR, f"{slug}.md")
    if os.path.exists(filepath):
        print(f"Error: {filepath} exists.")
        return
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created: {filepath}")

def main():
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest='command')
    subparsers.add_parser('build')
    new_p = subparsers.add_parser('new')
    new_p.add_argument('title')
    args = parser.parse_args()
    
    if args.command == 'build':
        build_blog()
    elif args.command == 'new':
        new_post(args.title)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()

import os
import json
import argparse
import datetime
import re

POSTS_DIR = 'posts'
INDEX_FILE = os.path.join(POSTS_DIR, 'index.json')

def parse_frontmatter(content):
    """
    Parses basic YAML frontmatter from a markdown string.
    Returns (frontmatter_dict, body_text)
    """
    # Normalize newlines
    content = content.replace('\r\n', '\n').strip()
    
    if not content.startswith('---'):
        return {}, content
    
    try:
        # Find the end of the frontmatter
        end_idx = content.index('\n---', 3)
        fm_text = content[3:end_idx].strip()
        body = content[end_idx+4:].strip()
        
        metadata = {}
        current_key = None
        
        for line in fm_text.split('\n'):
            line = line.strip()
            if not line: continue
            
            # Check for list items (tags)
            if line.startswith('- ') and current_key == 'tags':
                if 'tags' not in metadata: metadata['tags'] = []
                metadata['tags'].append(line[2:].strip())
                continue
            
            # Key-value pairs
            if ':' in line:
                key, val = line.split(':', 1)
                key = key.strip()
                val = val.strip()
                
                if key == 'tags':
                    current_key = 'tags'
                    if val and val.startswith('[') and val.endswith(']'):
                        # Handle inline list [a, b]
                        val = val[1:-1]
                        metadata['tags'] = [x.strip() for x in val.split(',') if x.strip()]
                    elif not val:
                        # Multiline list follows
                        metadata['tags'] = []
                    else:
                        # Single value or comma-separated
                        metadata['tags'] = [x.strip() for x in val.split(',') if x.strip()]
                else:
                    current_key = key
                    metadata[key] = val
                    
        return metadata, body
        
    except ValueError:
        return {}, content

def build_index():
    """
    Scans all .md files in posts/, extracts metadata, and writes index.json.
    """
    print(f"Scanning {POSTS_DIR}...")
    posts = []
    
    if not os.path.exists(POSTS_DIR):
        os.makedirs(POSTS_DIR)
        
    files = [f for f in os.listdir(POSTS_DIR) if f.endswith('.md')]
    
    for filename in files:
        filepath = os.path.join(POSTS_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        fm, body = parse_frontmatter(content)
        
        # Basic validation
        if not fm.get('title'):
            print(f"Warning: Skipping {filename} (no title)")
            continue
            
        slug = filename.replace('.md', '')
        
        # Calculate read time (approx 200 wpm)
        word_count = len(body.split())
        read_time = max(1, round(word_count / 200))
        
        post_data = {
            'slug': slug,
            'title': fm.get('title', 'Untitled'),
            'date': fm.get('date', ''),
            'excerpt': fm.get('excerpt', body[:150] + '...'),
            'tags': fm.get('tags', []),
            'readTime': f"{read_time} min read"
        }
        
        posts.append(post_data)
        
    # Sort by date descending
    posts.sort(key=lambda x: x['date'], reverse=True)
    
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2)
        
    print(f"Successfully indexed {len(posts)} posts to {INDEX_FILE}")

def new_post(title):
    """Creates a new post with the given title."""
    slug = title.lower().replace(' ', '-')
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    
    today = datetime.date.today().isoformat()
    
    content = f"""---
title: {title}
date: {today}
author: Shahil Ahmed
excerpt: Short description of the post.
tags:
  - Tech
---

Write your content here...
"""
    
    filepath = os.path.join(POSTS_DIR, f"{slug}.md")
    if os.path.exists(filepath):
        print(f"Error: File {filepath} already exists.")
        return
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Created new post: {filepath}")

def main():
    parser = argparse.ArgumentParser(description="Manage blog posts")
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Build command
    subparsers.add_parser('build', help='Rebuild index.json from markdown files')
    
    # New command
    new_parser = subparsers.add_parser('new', help='Create a new post')
    new_parser.add_argument('title', help='Title of the post')
    
    args = parser.parse_args()
    
    if args.command == 'build':
        build_index()
    elif args.command == 'new':
        new_post(args.title)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()

# Shahil Ahmed - Portfolio & Blog

This repository hosts my personal portfolio and technical blog, accessible at [shahil-sk.github.io](https://shahil-sk.github.io).

It is a **static website** built with HTML, CSS, and Vanilla JavaScript, featuring a custom **Python-based Static Site Generator (SSG)** that converts Markdown content into SEO-friendly HTML pages.

##  Key Features

*   **Custom SSG**: A lightweight Python script (`scripts/manage_posts.py`) compiles Markdown to static HTML.
*   **SEO Optimized**: Blog posts are pre-rendered as real HTML files with proper meta tags, ensuring search engine indexing.
*   **Obsidian Compatible**: Supports Obsidian-style image links (`![[image.png]]`) out of the box.
*   **Zero-Dependency Runtime**: The live site uses only vanilla JavaScript—no React, Vue, or heavy frameworks.
*   **Automated Deployment**: GitHub Actions handles the build and publishing process automatically.

##  Project Structure

*   `content/posts/`  **Source Code**: Write your Markdown files here.
*   `content/posts/images/`  **Source Images**: Place blog images here.
*   `posts/`  **Generated Output**: The build script outputs the final HTML files here. **Do not edit these manually.**
*   `scripts/manage_posts.py`  **The Builder**: The Python script that handles the conversion.
*   `.github/workflows/`  **Automation**: CI/CD configuration.

##  How to Write a New Blog Post

The workflow is simple: **Write in Markdown -> Push -> Live.**

### 1. Create a Post
Create a new `.md` file in `content/posts/` (e.g., `my-new-post.md`).

### 2. Add Frontmatter
Every post needs a metadata block at the top:

```yaml
---
title: My Awesome Post
date: 2026-02-19
author: Shahil Ahmed
excerpt: A short summary of the post for the preview card.
tags:
  - Tech
  - Security
---
```

### 3. Adding Images
You can use standard Markdown or **Obsidian-style** links. Both work!

1.  Drop your image into `content/posts/images/`.
2.  Link it in your post:
    *   **Standard:** `![Screenshot](images/screenshot.png)`
    *   **Obsidian:** `![[screenshot.png]]` (The script automatically fixes this for the web!)

### 4. Publish
Commit and push your changes to GitHub:

```bash
git add .
git commit -m "New post: My Awesome Post"
git push origin main
```

The **GitHub Action** will automatically:
1.  Convert your Markdown to HTML.
2.  Fix image paths.
3.  Update the `index.json` and `sitemap.xml`.
4.  Publish the changes live.

##  Local Development (Optional)

If you want to preview changes or generate the site locally before pushing:

1.  **Install Dependencies**:
    ```bash
    pip install markdown
    ```

2.  **Run the Build Script**:
    ```bash
    python scripts/manage_posts.py build
    ```
    This will process all files in `content/` and update the `posts/` directory.

3.  **Preview**:
    Open `index.html` in your browser.

##  Customization

*   **Blog Template**: Edit `blog-post.html` to change the layout of all generated blog pages.
*   **Styles**: `styles.css` (global) and `post.css` (blog-specific).
*   **Logic**: `script.js` handles the portfolio interactions, while the blog pages are static HTML.

##  License

© 2026 Shahil Ahmed. All rights reserved.

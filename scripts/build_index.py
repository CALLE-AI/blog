#!/usr/bin/env python3
"""Generate the static homepage article directory from content/posts.json."""

import argparse
from datetime import date
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = re.compile(r'<section class="post-directory" aria-label="Articles">.*?</section>', re.S)
IMAGE_PRELOAD = re.compile(r'<link rel="preload" href="[^"]+" as="image"\s*/>')


def sorted_posts(posts):
    if not posts:
        raise ValueError("The article directory must contain at least one post.")
    seen = set()
    for post in posts:
        for key in ("url", "title", "description", "category", "date"):
            if not isinstance(post.get(key), str) or not post[key].strip():
                raise ValueError(f"Missing article field: {key}")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", post["date"]):
            raise ValueError(f"Expected YYYY-MM-DD: {post['date']}")
        date.fromisoformat(post["date"])
        if post["url"] in seen:
            raise ValueError(f"Duplicate article URL: {post['url']}")
        seen.add(post["url"])
        if not post["image"].get("src") or not post["image"].get("alt"):
            raise ValueError(f"Missing cover image or alt text: {post['url']}")
    # Python's stable sort preserves the editorial order for same-day posts.
    return sorted(posts, key=lambda post: post["date"], reverse=True)


def image_markup(post, class_name=None):
    attrs = {"class": class_name} if class_name else {}
    attrs.update(post["image"])
    return '<img' + ''.join(f' {key}="{escape(str(value), quote=True)}"' for key, value in attrs.items()) + '/>'


def validate_files(posts):
    local_urls = {post['url'] for post in posts if post['url'].startswith('/')}
    for page in (ROOT / 'docs').glob('*/index.html'):
        if f'/{page.parent.name}/' not in local_urls:
            raise ValueError(f'Add this article to content/posts.json: {page.parent.name}')
    for post in posts:
        image = ROOT / 'docs' / post['image']['src'].lstrip('/')
        if not image.is_file():
            raise ValueError(f'Missing article cover: {image}')
        if post['url'].startswith('/'):
            page = ROOT / 'docs' / post['url'].lstrip('/') / 'index.html'
            if not page.is_file():
                raise ValueError(f'Missing article page: {page}')


def render_post(post, featured=False):
    published = date.fromisoformat(post["date"])
    label = f"{published.strftime('%B')} {published.day}, {published.year}"
    attrs = {"class": "featured-post" if featured else "post-row", "href": post["url"]}
    attrs.update({key: post[key] for key in ("target", "rel") if key in post})
    link = '<a' + ''.join(f' {key}="{escape(value, quote=True)}"' for key, value in attrs.items()) + '>'
    meta = f'<p class="post-meta"><span>{escape(post["category"])}</span><time datetime="{post["date"]}">{label}</time></p>'
    title = f'<h2>{escape(post["title"])}</h2>'
    if featured:
        cover = "featured-image chart-cover" if post.get("chartCover") else "featured-image"
        ratio = ''
        if post.get("chartCover"):
            width, height = int(post["image"]["width"]), int(post["image"]["height"])
            ratio = f' style="--cover-ratio:{width} / {height}"'
        return (link + '<div class="featured-copy">' + meta + title
                + f'<p>{escape(post["description"])}</p>'
                + '<span class="read-link">Read article <span aria-hidden="true">→</span></span></div>'
                + f'<div class="{cover}"{ratio}>' + image_markup(post) + '</div></a>')
    return (link + image_markup(post, "post-image") + meta + title
            + f'<p class="post-description">{escape(post["description"])}</p>'
            + '<span class="post-arrow" aria-hidden="true">→</span></a>')


def render_homepage(source, posts):
    ordered = sorted_posts(posts)
    section = ('<section class="post-directory" aria-label="Articles">'
               + render_post(ordered[0], featured=True)
               + '<div class="directory-heading"><h2>Latest</h2><span>All other articles</span></div>'
               + '<div class="post-list">' + ''.join(render_post(post) for post in ordered[1:])
               + '</div></section>')
    if len(DIRECTORY.findall(source)) != 1:
        raise ValueError("Expected exactly one homepage article directory.")
    result = DIRECTORY.sub(lambda _: section, source)
    result = IMAGE_PRELOAD.sub('', result)
    # Only the featured image is above the fold; do not preload every older cover.
    preload = f'<link rel="preload" href="{escape(ordered[0]["image"]["src"], quote=True)}" as="image"/>'
    return result.replace('</head>', preload + '</head>', 1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail when the committed homepage is stale.')
    args = parser.parse_args()
    posts = json.loads((ROOT / 'content/posts.json').read_text())
    sorted_posts(posts)
    validate_files(posts)
    page = ROOT / 'docs/index.html'
    current = page.read_text()
    generated = render_homepage(current, posts)
    if args.check:
        if generated != current:
            parser.exit(1, 'Homepage is stale. Run python3 scripts/build_index.py and commit docs/index.html.\n')
        print('Homepage is up to date: newest article featured, all remaining articles in date order.')
    else:
        page.write_text(generated)
        print(f'Generated homepage for {len(posts)} articles.')


if __name__ == '__main__':
    main()

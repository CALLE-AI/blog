# CALL-E Blog

Static files for the public CALL-E engineering blog.

GitHub Pages publishes the contents of `docs/` from the `main` branch.

## Local preview

```bash
python3 -m http.server 8000 -d docs
```

Then open <http://localhost:8000/>.

## Publishing and maintenance

See [BLOG_WORKFLOW.md](BLOG_WORKFLOW.md) for the reusable Chinese workflow covering editing, references, visual changes, local QA, publishing, cache troubleshooting, and ongoing maintenance.

## Homepage article order

`content/posts.json` is the single article directory, including externally hosted articles.
Add or update the title, publication date (`YYYY-MM-DD`), summary, link, and cover there, then run:

```bash
python3 scripts/build_index.py
python3 -m unittest discover -s tests
python3 scripts/build_index.py --check
```

Commit the metadata and generated `docs/index.html` together. The newest publication
date becomes the featured article; every remaining article appears once below it,
newest first. Entries with the same date keep their order in the metadata. No
article is pinned. Chart covers use `chartCover: true` with their image width and
height so both desktop and mobile display the full chart. The homepage is static
HTML and works without JavaScript. The check detects stale markup, missing local articles, and missing cover files.

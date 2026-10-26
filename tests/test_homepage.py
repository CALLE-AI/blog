import copy
from datetime import date, timedelta
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from build_index import ROOT, render_homepage, sorted_posts


class HomepageOrderingTests(unittest.TestCase):
    def setUp(self):
        self.posts = json.loads((ROOT / 'content/posts.json').read_text())
        self.source = (ROOT / 'docs/index.html').read_text()

    def test_latest_article_is_featured_and_every_other_article_appears_once(self):
        from html.parser import HTMLParser

        class Cards(HTMLParser):
            def __init__(self):
                super().__init__()
                self.links = []

            def handle_starttag(self, tag, attributes):
                attrs = dict(attributes)
                if tag == 'a' and attrs.get('class') in ('featured-post', 'post-row'):
                    self.links.append((attrs['class'], attrs['href']))

        result = render_homepage(self.source, self.posts)
        cards = Cards()
        cards.feed(result)
        ordered = sorted_posts(self.posts)
        self.assertEqual(cards.links, [('featured-post', ordered[0]['url'])]
                         + [('post-row', post['url']) for post in ordered[1:]])
        self.assertEqual(len({url for _, url in cards.links}), len(self.posts))
        self.assertEqual(render_homepage(result, self.posts), result)

    def test_new_article_automatically_replaces_featured_without_changing_template(self):
        newer = copy.deepcopy(self.posts[0])
        latest = sorted_posts(self.posts)[0]
        next_date = (date.fromisoformat(latest['date']) + timedelta(days=1)).isoformat()
        newer.update(url='/future-article/', title='Future article', date=next_date)
        result = render_homepage(self.source, [*self.posts, newer])
        self.assertIn('<a class="featured-post" href="/future-article/">', result)
        self.assertIn(f'<a class="post-row" href="{latest["url"]}">', result)
        self.assertNotIn('<a class="post-row" href="/future-article/">', result)

    def test_same_date_keeps_editorial_order(self):
        tied = [post['url'] for post in self.posts if post['date'] == '2026-05-28']
        self.assertEqual([post['url'] for post in sorted_posts(self.posts)
                          if post['date'] == '2026-05-28'], tied)

    def test_invalid_date_and_duplicate_urls_fail(self):
        bad = copy.deepcopy(self.posts)
        bad[0]['date'] = '2026-02-30'
        with self.assertRaises(ValueError):
            sorted_posts(bad)
        with self.assertRaises(ValueError):
            sorted_posts([*self.posts, self.posts[0]])


if __name__ == '__main__':
    unittest.main()

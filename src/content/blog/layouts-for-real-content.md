---
title: "Building Interfaces That Survive Real Content: Long Headings, Unbroken URLs, Nested Documentation, and Code That Refuses to Fit on One Line"
description: "Example post: HTML and CSS highlighting, heading levels, raw HTML, local imagery, wide tables, and Markdown edge cases."
pubDate: 2026-01-16
---

A layout built with short labels and two-line paragraphs has not met its real content yet. Eventually somebody pastes a stack trace, writes a descriptive title, or links to a URL that looks like a serialized database query.

This fixture keeps those awkward cases visible. **Bold**, *italic*, ***bold italic***, ~~strikethrough~~, a [normal link](/blog/hello-world), and [`a link containing code`](/blog/typed-api-boundaries) should all remain distinguishable in both color themes.

## HTML that looks like something we might actually ship

The code fence must display tags as text rather than render the form. Long attributes are intentional: syntax highlighting should preserve strings, comments, punctuation, and entities.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="A practical guide to deployment configuration, service ownership, and the surprisingly complicated task of making long technical content readable on narrow screens." />
    <title>Deployment configuration &amp; service ownership</title>
  </head>
  <body>
    <main class="settings-layout">
      <article aria-labelledby="page-title">
        <header>
          <p class="eyebrow">Engineering / Platform / Settings</p>
          <h1 id="page-title">Configure deployment notifications for services with names that are much longer than the original design anticipated</h1>
          <p>Choose where updates go when a deployment starts, succeeds, or needs attention.</p>
        </header>

        <!-- This form is sample markup, not an endpoint on the blog. -->
        <form action="/example/settings/notifications" method="post">
          <fieldset>
            <legend>Notification preferences</legend>
            <label for="destination">Destination URL</label>
            <input id="destination" name="destination" type="url" required aria-describedby="destination-help" placeholder="https://notifications.example.com/hooks/engineering/platform/deployment-status" />
            <p id="destination-help">Use an HTTPS endpoint controlled by your team. Query parameters such as <code>?environment=preview&amp;region=us-east</code> are preserved.</p>

            <label>
              <input type="checkbox" name="include_diagnostics" value="yes" />
              Include sanitized diagnostic information
            </label>
          </fieldset>
          <button type="submit">Save notification preferences</button>
        </form>

        <footer>
          <small>Last reviewed <time datetime="2026-01-16">January 16, 2026</time>.</small>
        </footer>
      </article>
    </main>
  </body>
</html>
```

## CSS for content, not just boxes

These are example rules, **not changes to this site’s stylesheet**. They demonstrate selectors, custom properties, functions, media queries, and a very long declaration.

```css
:root {
  --reading-width: 70ch;
  --surface: #faf9f6;
  --text: #242424;
  --border: color-mix(in srgb, var(--text) 18%, transparent);
}

.settings-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1rem, 3vw, 3rem);
  max-inline-size: var(--reading-width);
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 2rem);
  color: var(--text);
  background: var(--surface);
}

.settings-layout > article {
  min-inline-size: 0;
}

article :is(h1, h2, h3, h4, h5, h6) {
  line-height: 1.2;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

article :not(pre) > code,
article a {
  overflow-wrap: anywhere;
}

article pre {
  max-inline-size: 100%;
  overflow-x: auto;
  padding: 1rem;
  border: 1px solid var(--border);
  white-space: pre;
}

/* Opt-in alternative: preserve indentation but wrap long code lines. */
article pre.wrap-code {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

article input[type="url"] {
  box-sizing: border-box;
  inline-size: 100%;
  min-inline-size: 0;
  font-family: "Geist Mono", "SFMono-Regular", Consolas, "Liberation Mono", "Courier New", monospace;
  background-image: linear-gradient(135deg, color-mix(in srgb, var(--surface) 95%, #4385be) 0%, color-mix(in srgb, var(--surface) 92%, #879a39) 50%, color-mix(in srgb, var(--surface) 96%, #ce5d97) 100%);
}

@media (prefers-reduced-motion: no-preference) {
  article button {
    transition: background-color 150ms ease, border-color 150ms ease;
  }
}
```

### A long third-level heading about why a grid child’s minimum width can matter more than the overflow rule on its descendant

A scroll container can still be pushed wider than expected by its ancestors. When checking overflow, inspect the entire chain from the viewport to the content, not just the `pre` element.

#### Fourth-level heading: distinguish structure from emphasis

A heading introduces a section. **Bold text within a paragraph** calls attention to part of a sentence. They should not accidentally look identical.

##### Fifth-level heading: a smaller implementation note

Short paragraphs after small headings should still have a clear relationship to them.

###### Sixth-level heading: the last stop in the hierarchy

This intentionally deep hierarchy tests all the heading levels below the page title. Real posts should usually use a simpler outline.

## Wide data belongs in the test set too

| Component | Ordinary content | Pathological content | Expected behavior | Keyboard check |
| --- | --- | --- | --- | --- |
| Article title | A short sentence | A multi-clause title that takes several lines even on a reasonably wide laptop screen | Wrap without covering the publication date | Not interactive |
| Inline code | `config.timeout` | `deploymentNotificationConfiguration.environmentOverrides.production.maximumConcurrentDeliveryAttempts` | Stay inside the reading column | Not interactive |
| Code fence | A small function | A 250-character string, deeply nested JSX, or one very long CSS declaration | Scroll locally or wrap while preserving readable indentation | Check access to any horizontal scroll region |
| Table | Two narrow columns | Several verbose cells and long identifiers like `organization_platform_deployment_observability_configuration` | Remain readable without widening the entire page | Check scrolling on a narrow viewport |

## Raw HTML mixed with Markdown

<details>
<summary>Expand a native disclosure with a long summary explaining an edge case that should wrap instead of disappearing outside the article</summary>

This paragraph is **Markdown inside a native HTML disclosure**. Blank lines around the content let the Markdown parser recognize it.

- The summary should be operable with a keyboard.
- The expanded content should use the same typography as the article.
- Inline code like `min-width: 0` should remain readable.

</details>

A few inline HTML elements: press <kbd>Ctrl</kbd> + <kbd>K</kbd>, compare H<sub>2</sub>O with x<sup>2</sup>, and notice <mark>highlighted text</mark>. An abbreviation can carry a title: <abbr title="Application Programming Interface">API</abbr>.

## Image sizing without an external dependency

The following Markdown image reuses the site’s local favicon as a small-image fixture rather than introducing a network-dependent photo.

![The site favicon, used here to check how a small image sits between paragraphs.](/favicon.svg)

*An ordinary emphasized paragraph acting as a caption. It should not stick to the following heading.*

## Small formatting cases that are easy to forget

A hard line break follows this sentence.  
This is still the same paragraph, but on a new line.

Escaped punctuation should stay literal: \*not italic\*, \# not a heading, and \[not a link\]. HTML entities should render as text: &lt;section&gt;, &amp;, and &copy;.

Unicode should remain legible: café, naïve, résumé, →, ≤, ≠, and ✓. A non-Latin sample checks font fallback: 日本語のテキスト.

A fence can contain another fence when its outer delimiter is longer:

````markdown
## An example inside the example

```ts
const message = "This inner fence should be visible, not executed"
```
````

---

For more fixtures, see [the API boundary post](/blog/typed-api-boundaries), [the browser debugging post](/blog/debugging-browser-state), and [the incident toolbox](/blog/incident-toolbox).

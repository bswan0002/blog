# Astro + React + TypeScript + shadcn/ui

This is a template for a new Astro project with React, TypeScript, and shadcn/ui.

## Theme

The site uses [Flexoki](https://stephango.com/flexoki) by Steph Ango, with the
[MIT license](public/licenses/flexoki.txt) included. Typography and layout are independent of the palette.

- `src/styles/flexoki.css`: the official palette, vendored locally (no CDN dependency).
- `src/styles/global.css`: light/dark shadcn tokens, cyan links, selection, and highlights.
  Light-mode links use cyan 700 for sufficient text contrast on the paper background.
- `src/styles/typeset.css`: article typography and semantic color usage.
- `astro.config.mjs`: Markdown code blocks use VS Code **Light+ / Dark+**, not Flexoki.
  Shiki's dark-mode CSS in `global.css` follows the same `.dark` class as the UI.

The existing Light / Dark / System menu controls both the site and code blocks.
Inline code retains the surrounding Flexoki styling. If adding Astro's `<Code />`
component, pass `themes={{ light: "light-plus", dark: "dark-plus" }}` explicitly;
that component does not inherit the Markdown configuration.

## Fonts

Inter uses [Astro's Fonts API](https://docs.astro.build/en/guides/fonts/) with the
local provider pointing to the normal Latin WOFF2 file in the installed
`@fontsource-variable/inter` package (no remote font fetching).
`astro.config.mjs` registers its full variable weight range and keeps Astro's
optimized fallbacks enabled. `src/layouts/main.astro` preloads that single file,
and Tailwind's `--font-sans` uses the generated `--font-inter` stack
so the metric-adjusted fallbacks also apply to headings, navigation, and controls.
Do not also import Inter's Fontsource CSS; Astro generates its font-face rules.

Geist Mono continues to use its existing Fontsource CSS import without preloading.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them in an `.astro` file:

```astro
---
import { Button } from "@/components/ui/button"
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Astro App</title>
  </head>
  <body>
    <div class="grid h-screen place-items-center content-center">
      <Button>Button</Button>
    </div>
  </body>
</html>
```

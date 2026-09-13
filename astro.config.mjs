// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig, fontProviders } from "astro/config"
import react from "@astrojs/react"
import { satteri } from "@astrojs/markdown-satteri"
import scrollTables from "./src/lib/hast-scroll-tables.mjs"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Inter Variable",
      cssVariable: "--font-inter",
      options: {
        variants: [
          {
            src: ["@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"],
            weight: "100 900",
            style: "normal",
          },
        ],
      },
    },
  ],
  markdown: {
    processor: satteri({ hastPlugins: [scrollTables] }),
    shikiConfig: {
      themes: {
        light: "light-plus",
        dark: "dark-plus",
      },
    },
  },
})

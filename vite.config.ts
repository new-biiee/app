import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { codeInspectorPlugin } from "code-inspector-plugin";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeHighlight, rehypeKatex],
        providerImportSource: "@mdx-js/react",
      }),
    },
    react(),
    tailwindcss(),
    nodePolyfills(),
    codeInspectorPlugin({
      bundler: "vite",
    }),
    svgr(),
  ],
});

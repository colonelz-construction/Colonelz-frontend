import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dynamicImport from 'vite-plugin-dynamic-import';
import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-macros'],
      },
    }),
    ckeditor5({ theme: require.resolve('@ckeditor/ckeditor5-theme-lark') }),
    dynamicImport(),
  ],
  assetsInclude: ['**/*.md'],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/query': {
        target: 'https://chatbot.test.initz.run', // The API base URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/query/, '/query'),
        secure: false, // If the target is using HTTPS, set this to false to accept self-signed certificates.
      },
    },
  },
  build: {
    outDir: 'build',
    target: "ES2022",
  },
});

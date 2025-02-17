// vite.config.mts
import { defineConfig } from "file:///C:/Users/Administrator/Documents/GitHub/Colonelz-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Administrator/Documents/GitHub/Colonelz-frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import dynamicImport from "file:///C:/Users/Administrator/Documents/GitHub/Colonelz-frontend/node_modules/vite-plugin-dynamic-import/dist/index.mjs";
import ckeditor5 from "file:///C:/Users/Administrator/Documents/GitHub/Colonelz-frontend/node_modules/@ckeditor/vite-plugin-ckeditor5/dist/index.mjs";
import { createRequire } from "node:module";
var __vite_injected_original_dirname = "C:\\Users\\Administrator\\Documents\\GitHub\\Colonelz-frontend";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Administrator/Documents/GitHub/Colonelz-frontend/vite.config.mts";
var require2 = createRequire(__vite_injected_original_import_meta_url);
var vite_config_default = defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          "babel-plugin-macros"
        ]
      }
    }),
    ckeditor5({ theme: require2.resolve("@ckeditor/ckeditor5-theme-lark") }),
    dynamicImport()
  ],
  assetsInclude: ["**/*.md"],
  resolve: {
    alias: {
      "@": path.join(__vite_injected_original_dirname, "src")
    }
  },
  build: {
    outDir: "build",
    target: "ES2022"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5pc3RyYXRvclxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXENvbG9uZWx6LWZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcQ29sb25lbHotZnJvbnRlbmRcXFxcdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yL0RvY3VtZW50cy9HaXRIdWIvQ29sb25lbHotZnJvbnRlbmQvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgZHluYW1pY0ltcG9ydCBmcm9tICd2aXRlLXBsdWdpbi1keW5hbWljLWltcG9ydCdcclxuaW1wb3J0IGNrZWRpdG9yNSBmcm9tICdAY2tlZGl0b3Ivdml0ZS1wbHVnaW4tY2tlZGl0b3I1JztcclxuaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gJ25vZGU6bW9kdWxlJztcclxuY29uc3QgcmVxdWlyZSA9IGNyZWF0ZVJlcXVpcmUoIGltcG9ydC5tZXRhLnVybCApO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3Qoe1xyXG4gICAgYmFiZWw6IHtcclxuICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgICdiYWJlbC1wbHVnaW4tbWFjcm9zJyxcclxuICAgICAgXVxyXG4gICAgfVxyXG4gIH0pLFxyXG5cclxuICBja2VkaXRvcjUoIHsgdGhlbWU6IHJlcXVpcmUucmVzb2x2ZSggJ0Bja2VkaXRvci9ja2VkaXRvcjUtdGhlbWUtbGFyaycgKSB9ICksXHJcbiAgZHluYW1pY0ltcG9ydCgpXSxcclxuICBhc3NldHNJbmNsdWRlOiBbJyoqLyoubWQnXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IHBhdGguam9pbihfX2Rpcm5hbWUsICdzcmMnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiAnYnVpbGQnLFxyXG4gICAgdGFyZ2V0OlwiRVMyMDIyXCJcclxuICB9XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJXLFNBQVMsb0JBQW9CO0FBQ3hZLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxlQUFlO0FBQ3RCLFNBQVMscUJBQXFCO0FBTDlCLElBQU0sbUNBQW1DO0FBQTZMLElBQU0sMkNBQTJDO0FBTXZSLElBQU1BLFdBQVUsY0FBZSx3Q0FBZ0I7QUFHL0MsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQUMsTUFBTTtBQUFBLE1BQ2QsT0FBTztBQUFBLFFBQ0wsU0FBUztBQUFBLFVBQ1A7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBRUQsVUFBVyxFQUFFLE9BQU9BLFNBQVEsUUFBUyxnQ0FBaUMsRUFBRSxDQUFFO0FBQUEsSUFDMUUsY0FBYztBQUFBLEVBQUM7QUFBQSxFQUNmLGVBQWUsQ0FBQyxTQUFTO0FBQUEsRUFDekIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLEtBQUssa0NBQVcsS0FBSztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsUUFBTztBQUFBLEVBQ1Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJyZXF1aXJlIl0KfQo=

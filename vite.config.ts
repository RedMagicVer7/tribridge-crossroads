// 已移除重复导入，后续已有相同导入
import { defineConfig, loadEnv } from 'vite';
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // 对于GitHub Pages部署，使用仓库名作为base路径
    base: '/tribridge-crossroads/',
    server: {
      host: "::",
      port: 3000,
      // 允许访问index-test.html
      proxy: {
        '/index-test.html': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/index-test\.html/, '/index-test.html'),
        },
      },
    },
    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 1600,
    },

  };
});
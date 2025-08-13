import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@radix-ui/react-*'],
          },
        },
      },
    },
    define: {
      'process.env': { ...process.env, ...env }
    },
    base: '/',
    server: {
      port: 3000,
      strictPort: true,
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
    server: {
      fs: {
        strict: true,
      deny: ["**/.*"],
    },
  },
});

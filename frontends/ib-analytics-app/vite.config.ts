import { defineConfig, loadEnv, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import ts from "@rollup/plugin-typescript";

export default defineConfig(({ mode }: { mode: string }): UserConfig => {
  return {
    plugins: [
      react(),
      federation({
        name: "analytics_web_app", // Name of the remote module
        filename: "analytics_web_app.js", // Output filename for the federation
        exposes: {
          "./App": "./src/App.tsx",
        },
        shared: ['react', 'react-dom', 'react-redux', 'react-router-dom', 'recharts'],
      }),
    ],
    build: {
      modulePreload: false,
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
      rollupOptions: {
        plugins: [
          ts({
            tsconfig: "./tsconfig.json",
            sourceMap: false,
            declaration: true,
            outDir: "dist/types",
          }),
        ],
      },
    },
    preview: {
      host: "localhost",
      port: 5003,
      strictPort: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
    server: {
      port: 5003,
      open: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      hmr: { overlay: false },
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true, // Suppress deprecation warnings from dependencies
        },
      },
    },
  };
});

import { defineConfig, loadEnv, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import ts from "@rollup/plugin-typescript";

export default defineConfig(({ mode }: { mode: string }): UserConfig => {
  return {
    plugins: [
      react(),
      federation({
        name: "analytics_web_app",
        filename: "analytics_web_app.js",
        exposes: {
          "./App": "./src/App.tsx",
        },
        shared: [
          'react',
          'react-dom',
          'react-redux',
          'react-router-dom',
          '@react-pdf-viewer/core',
          '@react-pdf-viewer/default-layout',
          'recharts'
        ],
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
          {
            name: "copy-pdf-worker",
            generateBundle() {
              this.emitFile({
                type: "asset",
                fileName: "pdf.worker.min.js",
                source: require("fs").readFileSync(
                  require.resolve("pdfjs-dist/build/pdf.worker.min.js")
                ),
              });
            },
          },
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

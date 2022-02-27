import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), eslintPlugin()],

  define: { 'process.env': process.env },

  resolve: {
    alias: {
      path: 'path-browserify',
      process: 'process/browser',
      stream: "stream-browserify",
    },
  },

  optimizeDeps: {

    allowNodeBuiltins: [
      "ipfs-core",
      "ipfs-http-client",
      "orbit-db",
      "orbit-db-identity-provider",
      "orbit-db-store",
      // "libp2p",
      // "util",
    ],
    include: [
      // "merge-options",
      // "multiaddr",
      // "multiaddr-to-uri",

      // "libp2p-crypto",
      // "util",

      // "ipfs-core",
      // "ipfs-utils",
      // "ipfs-http-client > ipfs-utils",
    ],
    exclude: [
      "electron-fetch",
      // "process",
      // "ipfs-core",

      // "libp2p",
      // "ipfs-utils",
      "ipfs-http-client",
    ],
  },
});

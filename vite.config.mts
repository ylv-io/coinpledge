import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      // Integration tests use a verified temporary local deployment artifact.
      $contract: resolve(process.env.COINPLEDGE_ARTIFACT_PATH || 'build/contracts/CoinPledge.json'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    cssCodeSplit: false,
    rolldownOptions: {
      output: {
        entryFileNames: 'build.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: asset => asset.names.some(name => name.endsWith('.css'))
          ? 'styles.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
});

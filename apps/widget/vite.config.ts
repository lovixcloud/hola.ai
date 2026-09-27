import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'HolaWidget',
      fileName: 'widget',
      formats: ['iife', 'umd'],
    },
    outDir: 'dist',
  },
});

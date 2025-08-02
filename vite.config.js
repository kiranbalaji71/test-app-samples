import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic', 
      babel: {
        presets: [
          [
            '@babel/preset-react',
            { runtime: 'automatic' } 
          ]
        ],
      },
      include: '**/*.js',
    })
  ],
  esbuild: {
    loader: 'jsx', 
    include: /src\/.*\.js$/,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

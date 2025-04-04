import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import packageJson from './package.json';


export default defineConfig({
  plugins: [solidPlugin()],
  preview: {
    allowedHosts: ['maganszovetseg.net', 'demo.maganszovetseg.net'], // Allow both domains
  },
  server: {
    port: 4173, // demo on 4174
    allowedHosts: true,
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      external: ['@formatjs/fast-memoize'],
    },
  },
  assetsInclude: ['**/*.svg', '**/*.png'],
  envPrefix: 'PRIMAL_',
  define: {
    'import.meta.env.PRIMAL_VERSION': JSON.stringify(packageJson.version),
  },
  esbuild: {
    keepNames: true,
  },

});


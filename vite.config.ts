import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import packageJson from './package.json';


export default defineConfig({
  plugins: [solidPlugin()],
  preview: {
    allowedHosts: ['maganszovetseg.net', 'demo.maganszovetseg.net'], // Allow both domains
  },
  server: {
    port: 4174,
    allowedHosts: true,
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  envPrefix: 'PRIMAL_',
  define: {
    'import.meta.env.PRIMAL_VERSION': JSON.stringify(packageJson.version),
  },
  esbuild: {
    keepNames: true,
  },

});

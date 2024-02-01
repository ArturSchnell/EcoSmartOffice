import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import copy from 'rollup-plugin-copy'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    hmr: { host: '0.0.0.0' },
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    svelte(),
    copy({
      targets: [{
        src: 'node_modules/bootstrap/dist/**/*',
        dest: 'public/vendor/bootstrap'
      }, {
        src: 'node_modules/bootstrap/js/**/*',
        dest: 'public/vendor/bootstrap/js'
      }]
    }),],
})
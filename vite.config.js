import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A plain Vite + React single page app, so there is nothing to configure here beyond
// the React plugin. The dev and preview port (5188, strictPort) is set on the CLI in
// the package.json scripts.
export default defineConfig({
  plugins: [react()],
});

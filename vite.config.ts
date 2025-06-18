import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync('./192.168.0.177-key.pem'),
      cert: fs.readFileSync('./192.168.0.177.pem'),
    },
  },
});
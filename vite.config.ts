import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { flue } from '@flue/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react(), flue()],
});

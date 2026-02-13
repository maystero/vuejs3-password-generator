import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: '/app-password-generator/', // Określa katalog bazowy
  build: {
    outDir: 'dist', // Określa katalog wyjściowy (domyślnie 'dist')
    rollupOptions: {
      output: {
        // Dodatkowe opcje konfiguracji (jeśli potrzebujesz)
      }
    }
  },
  server: {
    open: true, // Automatycznie otwiera przeglądarkę
    port: 3000, // Ustawia port serwera deweloperskiego
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Cambia el puerto a 3000 u otro disponible
    strictPort: true, // Evita que busque otro puerto automáticamente
    hmr: {
      protocol: 'ws', // Asegúrate de que esté usando WebSocket
      host: 'localhost', // Asegúrate de que esté escuchando en localhost
      // Opcional: puedes especificar un path personalizado para HMR
      // clientPort: 3000, // Asegúrate de que coincida con el puerto del servidor
    },
  },
  preview: {
    allowedHosts: ['upmlab.es', '.upmlab.es'],
  }
});

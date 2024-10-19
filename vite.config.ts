import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    // basicSsl()
  ],
})
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl'
// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react(),
//     // basicSsl()
//   ],
// })
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     basicSsl()  // Enable HTTPS using the basic-ssl plugin
//   ],
//   server: {
//     https: true,  // Ensure HTTPS is enabled
//   }
// })

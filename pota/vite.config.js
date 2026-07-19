import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
	server: {
		port: 1339,
		open: '/',
	},
	build: {
		target: 'esnext',
	},
	worker: {
		format: 'es',
	},
  plugins: [solid()],
})

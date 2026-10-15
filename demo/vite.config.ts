import { fileURLToPath } from 'node:url';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const fromRoot = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));

export default defineConfig({
	plugins: [vue(), tailwindcss(), cloudflare()],
	resolve: {
		alias: [
			{ find: /^mfm-vue$/, replacement: fromRoot('src/index.ts') },
			{ find: 'aiscript-grammar', replacement: fromRoot('vendor/aiscript-vscode/aiscript/syntaxes/aiscript.tmLanguage.json') },
		],
	},
});

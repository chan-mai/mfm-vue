import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'aiscript-grammar': fileURLToPath(
				new URL(
					'./vendor/aiscript-vscode/aiscript/syntaxes/aiscript.tmLanguage.json',
					import.meta.url,
				),
			),
		},
	},
	build: {
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: 'index',
			cssFileName: 'style',
		},
		rollupOptions: {
			external: ['vue', 'mfm-js', 'punycode.js', 'tinycolor2', 'json5', /^shiki(\/|$)/, /^@misskey-dev\/emoji-data(\/|$)/],
		},
		sourcemap: true,
	},
	test: {
		environment: 'happy-dom',
		fsModuleCache: false,
	},
});

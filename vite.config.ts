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
	test: {
		environment: 'happy-dom',
		fsModuleCache: false,
	},
});

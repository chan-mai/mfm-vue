import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Vue from 'unplugin-vue/rolldown';
import { defineConfig } from 'tsdown';
import type { Rolldown } from 'tsdown';

// @tsdown/cssは<style src>形式のCSS対象外, 読込時にstyleブロックへ展開
const inlineStyleSrc: Rolldown.Plugin = {
	name: 'inline-vue-style-src',
	load: {
		filter: { id: /\.vue$/ },
		async handler(id: string) {
			let code = await readFile(id, 'utf8');
			for (const match of code.matchAll(/<style([^>]*?)\ssrc="([^"]+)"([^>]*)><\/style>/g)) {
				const [tag, before = '', src = '', after = ''] = match;
				const css = await readFile(resolve(dirname(id), src), 'utf8');
				code = code.replace(tag, `<style${before}${after}>\n${css}</style>`);
			}
			return code;
		},
	},
};

export default defineConfig({
	entry: { index: 'src/index.ts' },
	format: ['esm'],
	platform: 'neutral',
	fixedExtension: false,
	sourcemap: true,
	clean: true,
	tsconfig: 'tsconfig.build.json',
	dts: { vue: true },
	css: { fileName: 'style.css' },
	alias: {
		'aiscript-grammar': fileURLToPath(new URL('./vendor/aiscript-vscode/aiscript/syntaxes/aiscript.tmLanguage.json', import.meta.url)),
	},
	plugins: [inlineStyleSrc, Vue({ isProduction: true })],
});

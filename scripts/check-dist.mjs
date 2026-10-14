import { createRequire } from 'node:module';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

const dist = new URL('../dist/index.js', import.meta.url);
const esm = await import(dist.href);
const cjs = createRequire(import.meta.url)(dist.pathname);

const text =
	'**a** https://xn--r8jz45g.jp @a@xn--r8jz45g.jp :x: 👍 `c`\n```js\nconst a = 1;\n```\n$[tada b] $[unixtime 1700000000]';
for (const [name, mod] of [['import', esm], ['require', cjs]]) {
	const html = await renderToString(
		createSSRApp({ render: () => h(mod.Mfm, { text, instanceUrl: 'https://example.com' }) }),
	);
	for (const expected of ['例え.jp', '<b', 'mfm-block-code']) {
		if (!html.includes(expected)) {
			throw new Error(`${name}: rendered HTML lacks ${JSON.stringify(expected)}`);
		}
	}
}
console.log('dist: import, require, SSR ok');

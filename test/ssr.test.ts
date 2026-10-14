// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { Mfm } from '../src/index.js';

const ALL_SYNTAX = [
	'**bold** <i>italic</i> ~~strike~~ <small>small</small>',
	'> quote',
	'<center>center</center>',
	'@alice @bob@remote.example #tag https://example.com [link](https://example.com)',
	':emoji: 👍 `code` \\(x\\)',
	'```js\nconst a = 1;\n```',
	'\\[y\\]',
	'misskey 検索',
	'$[tada a] $[jelly a] $[twitch a] $[shake a] $[spin a] $[jump a] $[bounce a]',
	'$[flip a] $[x2 a] $[x3 a] $[x4 a] $[font.serif a] $[blur a] $[rainbow a]',
	'$[sparkle a] $[rotate a] $[position.x=1 a] $[scale.x=2 a] $[fg.color=f00 a]',
	'$[bg.color=0f0 a] $[border a] $[ruby a b] $[unixtime 1700000000] $[clickable.ev=x a]',
	'<plain>**plain**</plain>',
].join('\n');

describe('SSR', () => {
	it('全構文をDOM APIなしで描画', async () => {
		const app = createSSRApp({
			render: () =>
				h(Mfm, {
					text: ALL_SYNTAX,
					instanceUrl: 'https://misskey.example',
					customEmojis: { emoji: 'https://cdn/emoji.png' },
				}),
		});
		const html = await renderToString(app);
		expect(html).toContain('<span class="mfm mfm-base mfm-scheme-light mfm-motion-auto"');
		expect(html).toContain('mfm-sparkle');
		expect(html).toContain('2023-11-14 22:13:20 UTC');
		expect(html).not.toContain('$[');
	});

	it('テキスト中のHTMLタグをエスケープ', async () => {
		const app = createSSRApp({
			render: () => h(Mfm, { text: '<script>alert(1)</script> "x"' }),
		});
		const html = await renderToString(app);
		expect(html).not.toContain('<script>');
		expect(html).toContain('&lt;script&gt;');
	});
});

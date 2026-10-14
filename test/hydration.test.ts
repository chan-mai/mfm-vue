import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { Mfm } from '../src/index.js';

describe('ハイドレーション', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('SSRの出力との不一致警告なし', async () => {
		const text =
			'**a** @b #c https://example.com :em: $[sparkle s] $[unixtime 1700000000] $[x2 big]';
		const root = () => h(Mfm, { text, customEmojis: { em: 'u' } });
		const html = await renderToString(createSSRApp({ render: root }));

		const container = document.createElement('div');
		container.innerHTML = html;
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const app = createSSRApp({ render: root });
		app.mount(container);

		const messages = [...warn.mock.calls, ...error.mock.calls]
			.map((args) => args.join(' '))
			.filter((m) => /hydration/i.test(m));
		expect(messages).toEqual([]);
		app.unmount();
	});
});

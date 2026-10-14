import { describe, expect, it, vi } from 'vitest';
import { createInstanceEmojiResolver } from '../../src/index.js';
import { render } from '../helpers.js';

const INSTANCE = { instanceUrl: 'https://misskey.example' };

describe('emojiCode', () => {
	it('customEmojisのマップでURL解決', () => {
		const img = render(':a:', { customEmojis: { a: 'https://cdn/a.png' } }).get(
			'img.mfm-custom-emoji',
		);
		expect(img.attributes('src')).toBe('https://cdn/a.png');
		expect(img.attributes('alt')).toBe(':a:');
	});

	it('URL未解決時は:name:の文字列表示', () => {
		expect(render(':unknown:').text()).toBe(':unknown:');
	});

	it('リモート投稿はemojiUrls優先, emojiUrlsにない絵文字は文字列表示', () => {
		const w = render(':a: :b:', {
			author: { host: 'remote.example' },
			emojiUrls: { a: 'https://remote/a.png' },
			customEmojis: () => 'https://should-not-use',
		});
		expect(w.get('img').attributes('src')).toBe('https://remote/a.png');
		expect(w.text()).toContain(':b:');
	});

	it('createInstanceEmojiResolverで/emojiのURL生成', () => {
		const w = render(':a:', {
			author: { host: 'remote.example' },
			customEmojis: createInstanceEmojiResolver('https://misskey.example'),
		});
		expect(w.get('img').attributes('src')).toBe(
			'https://misskey.example/emoji/a@remote.example.webp',
		);
	});

	it('拡大率2.5倍以上はプロキシの絵文字用縮小なし, 表示サイズは同一', () => {
		const w = render('$[x3 :a:]', {
			...INSTANCE,
			author: { host: 'remote.example' },
			emojiUrls: { a: 'https://remote.example/a.gif' },
			mediaProxy: 'https://proxy.example',
		});
		const img = w.get('img.mfm-custom-emoji');
		expect(img.attributes('src')).toBe(
			`https://proxy.example/image.webp?url=${encodeURIComponent('https://remote.example/a.gif')}`,
		);
		expect(img.classes()).toEqual(['mfm-custom-emoji']);
	});

	it('mediaProxy指定時はリモート絵文字をプロキシ経由で表示', () => {
		const w = render(':a:', {
			...INSTANCE,
			author: { host: 'remote.example' },
			emojiUrls: { a: 'https://remote.example/a.gif' },
			mediaProxy: 'https://proxy.example',
		});
		expect(w.get('img.mfm-custom-emoji').attributes('src')).toBe(
			`https://proxy.example/image.webp?url=${encodeURIComponent('https://remote.example/a.gif')}&emoji=1`,
		);
	});

	it('disableAnimatedImages指定時は絵文字とアバターを静止画化', () => {
		const w = render(':a: @bob', {
			...INSTANCE,
			author: { host: 'remote.example' },
			emojiUrls: { a: 'https://remote.example/a.gif' },
			mediaProxy: 'https://proxy.example',
			disableAnimatedImages: true,
		});
		expect(w.get('img.mfm-custom-emoji').attributes('src')).toContain('static=1');
		expect(w.get('.mfm-mention img').attributes('src')).toBe(
			`https://proxy.example/static.webp?url=${encodeURIComponent('https://misskey.example/avatar/@bob@remote.example')}&static=1`,
		);
	});
});

describe('unicodeEmoji', () => {
	it('instanceUrl未指定時はルート相対の/twemoji', () => {
		expect(render('👍').get('img').attributes('src')).toBe('/twemoji/1f44d.svg');
	});

	it('instanceUrl指定時は取得元サーバの/twemoji', () => {
		expect(render('👍', INSTANCE).get('img').attributes('src')).toBe(
			'https://misskey.example/twemoji/1f44d.svg',
		);
	});

	it('ZWJを含まない絵文字はファイル名からFE0F除去', () => {
		expect(render('❤️', INSTANCE).get('img').attributes('src')).toBe(
			'https://misskey.example/twemoji/2764.svg',
		);
	});

	it('ZWJを含む絵文字はファイル名にFE0F維持', () => {
		expect(render('🏳️‍🌈', INSTANCE).get('img').attributes('src')).toBe(
			'https://misskey.example/twemoji/1f3f3-fe0f-200d-1f308.svg',
		);
	});

	it('emojiStyleがfluentEmojiの場合は/fluent-emoji, 国旗のみ/twemoji', () => {
		const opts = { emojiStyle: 'fluentEmoji' as const };
		expect(render('👍', opts).get('img').attributes('src')).toBe('/fluent-emoji/1f44d.png');
		expect(render('🇯🇵', opts).get('img').attributes('src')).toBe('/twemoji/1f1ef-1f1f5.svg');
	});

	it('emojiStyleがnativeの場合は文字表示, 1コードポイントはFE0F付与', () => {
		expect(
			render('👍', { emojiStyle: 'native' }).find('span.mfm-unicode-emoji-char').text(),
		).toBe('👍️');
	});

	it('unicodeEmojiUrlがnullの場合は画像なし', () => {
		expect(render('👍', { ...INSTANCE, unicodeEmojiUrl: null }).find('img').exists()).toBe(
			false,
		);
	});

	it('ホバー時に絵文字名をtitleへ設定', async () => {
		const w = render('👍');
		await w.get('img').trigger('pointerenter');
		await vi.waitFor(() => {
			expect(w.get('img').attributes('title')).toBe('+1');
		});
	});
});

describe('画像', () => {
	it('アバター, カスタム絵文字, Unicode絵文字はRefererなしで読み込み', () => {
		const imgs = render('@alice :em: 👍', {
			...INSTANCE,
			customEmojis: { em: 'https://cdn/em.png' },
		}).findAll('img');
		expect(imgs).toHaveLength(3);
		for (const img of imgs) {
			expect(img.attributes('referrerpolicy')).toBe('no-referrer');
		}
	});
});

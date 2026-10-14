import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { Mfm, createUrlPreviewFetcher } from '../../src/index.js';

describe('urlPreview', () => {
	it('ホバーから300ms後に取得結果を表示, 離脱時に非表示', async () => {
		const fetcher = vi.fn().mockResolvedValue({
			url: 'https://example.com/',
			title: 'Example Title',
			description: 'desc',
			thumbnail: null,
			icon: null,
			sitename: 'Example',
		});
		const w = mount(Mfm, {
			props: { text: 'https://example.com/', urlPreview: fetcher },
			attachTo: document.body,
		});
		await w.get('a.mfm-url').trigger('mouseover');
		expect(document.querySelector('.mfm-url-preview')).toBeNull();
		await vi.waitFor(() => {
			expect(document.querySelector('.mfm-url-preview .title')?.textContent).toBe(
				'Example Title',
			);
		});
		expect(fetcher).toHaveBeenCalledWith('https://example.com/');
		await w.get('a.mfm-url').trigger('mouseleave');
		expect(document.querySelector('.mfm-url-preview')).toBeNull();
		w.unmount();
	});

	it('未指定時はホバーしても表示なし', async () => {
		const w = mount(Mfm, { props: { text: 'https://example.com/' }, attachTo: document.body });
		await w.get('a.mfm-url').trigger('mouseover');
		await new Promise((r) => setTimeout(r, 400));
		expect(document.querySelector('.mfm-url-preview')).toBeNull();
		w.unmount();
	});
});

describe('createUrlPreviewFetcher', () => {
	it('ハッシュを除いたURLとlangで取得し, 欠損値null', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ url: 'https://example.com/', title: 'T' }),
		});
		const fetcher = createUrlPreviewFetcher('https://misskey.example/url', {
			lang: 'ja-JP',
			// eslint-disable-next-line id-denylist
			fetch: fetchMock as unknown as typeof fetch,
		});
		const r = await fetcher('https://example.com/#hash');
		expect(fetchMock).toHaveBeenCalledWith(
			'https://misskey.example/url?url=https%3A%2F%2Fexample.com%2F&lang=ja-JP',
		);
		expect(r?.title).toBe('T');
		expect(r?.description).toBeNull();
	});
});

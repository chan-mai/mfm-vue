import { describe, expect, it, vi } from 'vitest';
import { defined, render } from '../helpers.js';

const INSTANCE = { instanceUrl: 'https://misskey.example' };

describe('url', () => {
	it('外部URLを別タブのリンクで描画', () => {
		const a = render('https://example.com/a%20b?x=1').get('a.mfm-url');
		expect(a.attributes('href')).toBe('https://example.com/a%20b?x=1');
		expect(a.attributes('target')).toBe('_blank');
		expect(a.attributes('rel')).toContain('noopener');
		expect(a.text()).toBe('https://example.com/a b?x=1');
	});

	it('スキーム, ホスト名, パス, クエリ, ハッシュを個別要素で表示', () => {
		const a = render('https://example.com:8080/p%C3%A4th?q=1#h').get('a.mfm-url');
		expect(a.get('.schema').text()).toBe('https://');
		expect(a.get('.hostname').text()).toBe('example.com');
		expect(a.text()).toContain(':8080');
		expect(a.get('.pathname').text()).toBe('/päth');
		expect(a.get('.query').text()).toBe('?q=1');
		expect(a.get('.hash').text()).toBe('#h');
		expect(a.find('svg').exists()).toBe(true);
	});

	it('取得元サーバのURLはパスのみ表示, target指定とアイコンなし', () => {
		const a = render('https://misskey.example/notes/1', INSTANCE).get('a.mfm-url');
		expect(a.text()).toBe('notes/1');
		expect(a.attributes('target')).toBeUndefined();
		expect(a.find('svg').exists()).toBe(false);
	});

	it('取得元サーバのトップページはホスト名表示', () => {
		const a = render('https://misskey.example/', INSTANCE).get('a.mfm-url');
		expect(a.get('.hostname').text()).toBe('misskey.example');
	});

	it('国際化ドメイン名をUnicode表記', () => {
		expect(render('https://xn--r8jz45g.jp/').get('.hostname').text()).toBe('例え.jp');
	});
});

describe('link', () => {
	it('子要素をMFMとして描画', () => {
		const a = render('[**label**](https://example.com)').get('a.mfm-link');
		expect(a.attributes('href')).toBe('https://example.com');
		expect(a.find('b').text()).toBe('label');
	});

	it('外部リンクアイコンとURLのtitle付与', () => {
		const a = render('[label](https://example.com)').get('a.mfm-link');
		expect(a.attributes('title')).toBe('https://example.com');
		expect(a.find('svg').exists()).toBe(true);
	});

	it('http, https以外のスキームはリンク化なし', () => {
		expect(render('[x](javascript:alert(1))').find('a').exists()).toBe(false);
	});
});

describe('navigate', () => {
	it('取得元サーバ内リンクの通常クリックのみパスを通知', async () => {
		const navigate = vi.fn();
		const w = render('@alice #tag https://misskey.example/notes/1 https://example.com', {
			...INSTANCE,
			navigate,
		});
		await w.get('a.mfm-mention').trigger('click');
		await w.get('a.mfm-hashtag').trigger('click');
		const urls = w.findAll('a.mfm-url');
		await defined(urls[0]).trigger('click');
		await defined(urls[1]).trigger('click');
		await w.get('a.mfm-mention').trigger('click', { ctrlKey: true });
		expect(navigate.mock.calls.map((c) => c[0])).toEqual(['/@alice', '/tags/tag', '/notes/1']);
	});
});

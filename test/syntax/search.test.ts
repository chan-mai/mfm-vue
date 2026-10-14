import { describe, expect, it } from 'vitest';
import { render } from '../helpers.js';

describe('search', () => {
	it('検索語を入力欄の初期値へ設定', () => {
		expect((render('misskey 検索').get('form.mfm-search input').element as HTMLInputElement).value).toBe(
			'misskey',
		);
	});

	it('searchEngine未指定時Google', () => {
		expect(render('q 検索').get('form').attributes('action')).toBe(
			'https://www.google.com/search',
		);
	});

	it('searchEngineのクエリ文字列をフォームのaction, name, hidden要素へ変換', () => {
		const form = render('q 検索', {
			searchEngine: 'https://duckduckgo.com/?ia=web&q={query}',
		}).get('form');
		expect(form.attributes('action')).toBe('https://duckduckgo.com/');
		expect(form.get('input.input').attributes('name')).toBe('q');
		expect(form.get('input[type="hidden"]').attributes('name')).toBe('ia');
	});
});

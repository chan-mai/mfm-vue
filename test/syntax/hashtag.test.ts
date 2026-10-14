import { describe, expect, it } from 'vitest';
import { render } from '../helpers.js';

describe('hashtag', () => {
	it('タグ名をURLエンコードして/tagsへリンク', () => {
		const w = render('#ミスキー', { instanceUrl: 'https://misskey.example' });
		expect(w.get('a.mfm-hashtag').attributes('href')).toBe(
			`https://misskey.example/tags/${encodeURIComponent('ミスキー')}`,
		);
	});

	it('isNote無効時は/user-tagsへリンク', () => {
		expect(render('#tag', { isNote: false }).get('a.mfm-hashtag').attributes('href')).toBe(
			'/user-tags/tag',
		);
	});

	it('paths.hashtag指定時はリンク先パス変更', () => {
		const w = render('#tag', { paths: { hashtag: (tag) => `/search?tag=${tag}` } });
		expect(w.get('a.mfm-hashtag').attributes('href')).toBe('/search?tag=tag');
	});
});

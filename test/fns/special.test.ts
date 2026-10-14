import { describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';
import { render } from '../helpers.js';

describe('ruby', () => {
	it('テキストのみの場合は空白の前を本文, 後をルビ', () => {
		const ruby = render('$[ruby 漢字 かんじ]').get('ruby');
		expect(ruby.element.firstChild?.textContent).toBe('漢字');
		expect(ruby.get('rt').text()).toBe('かんじ');
	});

	it('本文がMFMの場合は最後のテキストをルビ', () => {
		const w = render('$[ruby **太字** ふりがな]');
		expect(w.find('ruby b').text()).toBe('太字');
		expect(w.find('rt').text()).toBe('ふりがな');
	});
});

describe('unixtime', () => {
	it('秒をISO 8601のdatetime属性へ変換', () => {
		expect(render('$[unixtime 1700000000]').get('time').attributes('datetime')).toBe(
			'2023-11-14T22:13:20.000Z',
		);
	});

	it('数値以外は解析失敗の文言を表示', () => {
		const time = render('$[unixtime abc]', { locale: 'ja-JP' }).get('time');
		expect(time.text()).toBe('日時の解析に失敗');
		expect(time.attributes('title')).toBe('日時の解析に失敗');
		expect(time.attributes('datetime')).toBeUndefined();
	});

	it('マウント後にlocaleの書式の日時をtitleへ設定', async () => {
		const w = render('$[unixtime 1700000000]', { locale: 'ja-JP' });
		await nextTick();
		expect(w.get('time').attributes('title')).toMatch(/^2023\/11\/1[45]/);
	});
});

describe('clickable', () => {
	it('クリック時にev引数をclickEvイベントで通知', async () => {
		const w = render('$[clickable.ev=foo click]');
		await w.get('.mfm-clickable').trigger('click');
		expect(w.emitted('clickEv')).toEqual([['foo']]);
	});
});

describe('未知の関数', () => {
	it('元の記法で表示し子要素はMFMとして描画', () => {
		expect(render('$[unknown **a**]').text()).toBe('$[unknown a]');
	});
});

describe('fns', () => {
	it('独自関数の追加とfalse指定による組み込み関数の無効化', () => {
		const w = render('$[hello a] $[tada b]', {
			fns: {
				hello: (ctx) => h('mark', ctx.renderChildren()),
				tada: false,
			},
		});
		expect(w.get('mark').text()).toBe('a');
		expect(w.text()).toContain('$[tada b]');
	});
});

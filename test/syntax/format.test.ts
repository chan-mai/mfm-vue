import { describe, expect, it, vi } from 'vitest';
import { defined, render } from '../helpers.js';

describe('ルート要素', () => {
	it('空文字列で描画なし', () => {
		expect(render('').find('span').exists()).toBe(false);
	});

	it('nowrap指定でmfm-nowrapクラス付与', () => {
		expect(render('a', { animated: true }).get('span.mfm').classes()).toEqual([
			'mfm',
			'mfm-base',
			'mfm-scheme-light',
		]);
		expect(render('a', { nowrap: true }).get('span.mfm').classes()).toContain('mfm-nowrap');
	});

	it('描画関数生成の要素にもscope属性付与', () => {
		const w = render('**a** $[tada b]');
		const scope = Object.keys(w.get('span.mfm').attributes()).find((k) =>
			k.startsWith('data-v-'),
		);
		expect(scope).toBeDefined();
		expect(w.get('b').attributes()).toHaveProperty(defined(scope));
		expect(w.get('.mfm-anim-tada').attributes()).toHaveProperty(defined(scope));
	});

	it('text変更時に再描画', async () => {
		const w = render('**a**');
		await w.setProps({ text: '~~b~~' });
		expect(w.find('b').exists()).toBe(false);
		expect(w.get('del').text()).toBe('b');
	});
});

describe('text', () => {
	it('改行コードをbr要素へ変換', () => {
		const w = render('a\nb\r\nc');
		expect(w.findAll('br')).toHaveLength(2);
		expect(w.text()).toBe('abc');
	});
});

describe('書式構文', () => {
	it('bold, italic, strike, smallを対応要素で描画', () => {
		const w = render('**b** <i>i</i> ~~s~~ <small>sm</small>');
		expect(w.find('b').text()).toBe('b');
		expect(w.find('i.mfm-italic').text()).toBe('i');
		expect(w.find('del').text()).toBe('s');
		expect(w.find('small.mfm-small').text()).toBe('sm');
	});

	it('quote, centerをdiv要素で描画', () => {
		const w = render('> quote\n<center>c</center>');
		expect(w.find('div.mfm-quote').text()).toBe('quote');
		expect(w.find('div.mfm-center').text()).toBe('c');
	});
});

describe('plain', () => {
	it('内側のMFM構文を文字列のまま表示', () => {
		const w = render('<plain>**a**</plain>');
		expect(w.find('b').exists()).toBe(false);
		expect(w.text()).toBe('**a**');
	});
});

describe('plainモード', () => {
	it('絵文字以外の構文と改行を解析対象外', () => {
		const w = render('**a** :em:\nb', { plain: true, customEmojis: { em: 'u' } });
		expect(w.find('b').exists()).toBe(false);
		expect(w.find('br').exists()).toBe(false);
		expect(w.get('img').classes()).toContain('normal');
	});
});

describe('未知のノード種別', () => {
	it('描画なし, エラーを出力', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const nodes = [
			{ type: 'text', props: { text: 'a' } },
			{ type: 'newNode', children: [{ type: 'text', props: { text: 'b' } }] },
		] as never;
		expect(render('', { nodes }).text()).toBe('a');
		expect(error).toHaveBeenCalledWith('[mfm-vue] Unrecognized node type: newNode');
		error.mockRestore();
	});
});

import { describe, expect, it } from 'vitest';
import { fnStyle, render, renderFn } from '../helpers.js';

describe('fg, bg', () => {
	it('16進の色指定を反映', () => {
		expect(fnStyle('$[fg.color=0f0 a]')).toContain('color: #0f0');
	});

	it('16進以外の色指定は既定の赤', () => {
		expect(fnStyle('$[bg.color=red a]')).toContain('background-color: #f00');
	});
});

describe('border', () => {
	it('style, width, radius, color引数を反映', () => {
		const style = fnStyle('$[border.style=dashed,width=2,radius=4,color=00f a]');
		expect(style).toContain('border-width: 2px');
		expect(style).toContain('border-style: dashed');
		expect(style).toContain('border-color: #00f');
		expect(style).toContain('border-radius: 4px');
	});

	it('許可リスト外のstyleはsolid', () => {
		expect(fnStyle('$[border.style=evil a]')).toContain('border-style: solid');
	});

	it('noclip指定時のみ枠外の描画を許可', () => {
		expect(renderFn('$[border a]').classes()).toContain('mfm-fn-clip');
		expect(renderFn('$[border.noclip a]').classes()).not.toContain('mfm-fn-clip');
	});
});

describe('font', () => {
	it('フォント指定をfont-familyへ反映', () => {
		expect(fnStyle('$[font.monospace a]')).toContain('font-family: monospace');
	});

	it('フォント指定なしは元の記法で表示', () => {
		expect(render('$[font a]').text()).toBe('$[font a]');
	});
});

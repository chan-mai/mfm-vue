import { describe, expect, it } from 'vitest';
import { fnStyle, render, renderFn } from '../helpers.js';

describe('アニメーション関数', () => {
	it('キーフレームをクラス, 既定の速度でinline style指定なし', () => {
		expect(renderFn('$[tada a]').classes()).toEqual(['mfm-fn', 'mfm-fn-tada', 'mfm-anim-tada']);
		expect(fnStyle('$[tada a]')).toBe('');
	});

	it('speed, delay引数をanimation-duration, animation-delayへ反映', () => {
		expect(fnStyle('$[spin.speed=2s a]')).toContain('animation-duration: 2s');
		expect(fnStyle('$[jump.delay=1s a]')).toContain('animation-delay: 1s');
	});

	it('秒数として不正なspeedは無視', () => {
		expect(fnStyle('$[shake.speed=fast a]')).not.toContain('animation');
	});

	it('spinのx, left引数で回転軸と方向を変更', () => {
		const spin = renderFn('$[spin.x,left a]');
		expect(spin.classes()).toContain('mfm-anim-spin-x');
		expect(spin.attributes('style')).toContain('animation-direction: reverse');
	});

	it('tadaはanimated無効時も150%の文字サイズ', () => {
		expect(renderFn('$[tada a]', { animated: false }).classes()).toEqual([
			'mfm-fn',
			'mfm-fn-tada',
		]);
	});
});

describe('animated', () => {
	it('未指定時はprefers-reduced-motion追従クラス付与', () => {
		expect(render('$[spin a]').get('span.mfm').classes()).toContain('mfm-motion-auto');
	});

	it('true指定時はprefers-reduced-motionに関係なく再生', () => {
		const w = render('$[spin a]', { animated: true });
		expect(w.get('span.mfm').classes()).not.toContain('mfm-motion-auto');
		expect(w.find('.mfm-anim-spin').exists()).toBe(true);
	});

	it('false指定時はアニメーションクラスなし', () => {
		expect(renderFn('$[spin a]', { animated: false }).classes()).toEqual(['mfm-fn']);
	});
});

describe('sparkle', () => {
	it('animated有効時はパーティクル用要素で描画', () => {
		expect(render('$[sparkle a]').find('.mfm-sparkle').exists()).toBe(true);
	});

	it('animated無効時は子要素のみ描画', () => {
		expect(render('$[sparkle a]', { animated: false }).find('.mfm-sparkle').exists()).toBe(false);
	});
});

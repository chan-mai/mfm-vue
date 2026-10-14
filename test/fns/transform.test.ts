import { describe, expect, it } from 'vitest';
import { fnStyle, render } from '../helpers.js';

describe('変形関数', () => {
	it('flipのh, v引数で反転方向を変更', () => {
		expect(fnStyle('$[flip a]')).toContain('scaleX(-1)');
		expect(fnStyle('$[flip.v a]')).toContain('scaleY(-1)');
		expect(fnStyle('$[flip.h,v a]')).toContain('scale(-1, -1)');
	});

	it('rotateのdeg引数で回転角を指定', () => {
		expect(fnStyle('$[rotate.deg=45 a]')).toContain('rotate(45deg)');
	});

	it('positionのx, y引数をem単位の移動量へ変換', () => {
		expect(fnStyle('$[position.x=1,y=-2 a]')).toContain('translateX(1em) translateY(-2em)');
	});

	it('scaleの倍率は最大5倍', () => {
		expect(fnStyle('$[scale.x=10,y=2 a]')).toContain('scale(5, 2)');
	});

	it('advanced無効時はx2, positionの変形なし', () => {
		expect(render('$[x2 a]', { advanced: false }).find('.mfm-x2').exists()).toBe(false);
		expect(fnStyle('$[position.x=5 a]', { advanced: false })).not.toContain('transform');
	});
});

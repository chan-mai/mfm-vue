import { describe, expect, it } from 'vitest';
import { render } from './helpers.js';

describe('nyaize', () => {
	it('respect指定時はauthor.isCatがtrueの場合のみ変換', () => {
		expect(render('なにぬねの', { nyaize: 'respect', author: { isCat: true } }).text()).toBe(
			'にゃにぬねの',
		);
		expect(render('なにぬねの', { nyaize: 'respect', author: { isCat: false } }).text()).toBe(
			'なにぬねの',
		);
	});

	it('引用, plain, インラインコード内は変換対象外', () => {
		expect(render('な\n> な\n<plain>な</plain>`な`', { nyaize: true }).text()).toBe('にゃななな');
	});
});

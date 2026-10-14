import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { Mfm, provideMfmConfig } from '../../src/index.js';
import { render } from '../helpers.js';
import type { MfmProps } from '../helpers.js';

async function renderHighlighted(text: string, props: Partial<MfmProps> = {}) {
	const w = render(text, props);
	await vi.waitFor(
		() => expect(w.findAll('.mfm-block-code pre span').length).toBeGreaterThan(0),
		{ timeout: 10000 },
	);
	return w;
}

describe('inlineCode', () => {
	it('code要素で描画', () => {
		expect(render('`inline`').find('code.mfm-inline-code').text()).toBe('inline');
	});
});

describe('blockCode', () => {
	it('言語名をdata-langへ設定', () => {
		const w = render('```js\nconst a = 1;\n```', { highlight: false });
		expect(w.get('.mfm-block-code pre code').attributes('data-lang')).toBe('js');
		expect(w.get('.mfm-block-code pre').text()).toBe('const a = 1;');
	});

	it('ライト, ダーク両テーマの色をCSS変数で出力', async () => {
		const w = await renderHighlighted('```js\nconst a = 1;\n```');
		const keyword = w.findAll('.mfm-block-code pre span').find((s) => s.text() === 'const');
		expect(keyword?.attributes('style')).toContain('--shiki-light');
		expect(keyword?.attributes('style')).toContain('--shiki-dark');
		expect(w.get('.mfm-block-code pre').text()).toBe('const a = 1;');
	});

	it('未対応の言語はjsとしてハイライト', async () => {
		await renderHighlighted('```unknownlang\nconst a = 1;\n```');
	});

	it('aiscriptをAiScriptの文法でハイライト', async () => {
		const w = await renderHighlighted('```aiscript\nlet x = "a"\n<: x\n```');
		const styles = new Set(w.findAll('.mfm-block-code pre span').map((s) => s.attributes('style')));
		expect(styles.size).toBeGreaterThan(1);
	});

	it('highlight無効時はハイライトなし', async () => {
		const w = render('```js\nconst a = 1;\n```', { highlight: false });
		await new Promise((r) => setTimeout(r, 300));
		expect(w.findAll('.mfm-block-code pre span')).toHaveLength(0);
	});

	it('dataSaver.code指定時はクリックまでコード非表示', async () => {
		const w = render('```\nsecret\n```', { dataSaver: { code: true }, locale: 'ja' });
		expect(w.find('pre').exists()).toBe(false);
		expect(w.get('.placeholder').text()).toContain('クリックして表示');
		await w.get('.placeholder').trigger('click');
		expect(w.get('pre').text()).toBe('secret');
	});
});

describe('コピー', () => {
	it('コピー結果をcopyイベントとonCopyで通知', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal('navigator', { clipboard: { writeText } });
		const onCopy = vi.fn();
		const w = render('```\ncode\n```', { highlight: false });
		await w.get('.copy').trigger('click');
		await flushPromises();
		expect(w.emitted('copy')).toEqual([[{ text: 'code', success: true }]]);

		const Parent = defineComponent({
			setup() {
				provideMfmConfig({ onCopy, highlight: false });
				return () => h(Mfm, { text: '```\ncode\n```' });
			},
		});
		const p = mount(Parent);
		await p.get('.copy').trigger('click');
		await flushPromises();
		expect(onCopy).toHaveBeenCalledWith({ text: 'code', success: true });
		vi.unstubAllGlobals();
	});

	it('クリップボードへの書き込み失敗時はsuccess: false', async () => {
		const writeText = vi.fn().mockRejectedValue(new Error('denied'));
		vi.stubGlobal('navigator', { clipboard: { writeText } });
		const w = render('```\ncode\n```', { highlight: false });
		await w.get('.copy').trigger('click');
		await flushPromises();
		expect(w.emitted('copy')).toEqual([[{ text: 'code', success: false }]]);
		vi.unstubAllGlobals();
	});
});

describe('math', () => {
	it('mathInline, mathBlockをcode要素で描画', () => {
		const w = render('\\(x^2\\)\n\\[y\\]');
		expect(w.find('code.mfm-math').text()).toBe('x^2');
		expect(w.find('code.mfm-math-block').text()).toBe('y');
	});
});

import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { Mfm, provideMfmConfig } from '../src/index.js';
import { defined, render } from './helpers.js';
import type { MfmOptions } from '../src/index.js';

describe('components', () => {
	it('差し替えたlinkコンポーネントへ子要素をdefault slot継承', () => {
		const Link = defineComponent({
			props: { url: { type: String, required: true } },
			setup(props, { slots }) {
				return () => h('a', { class: 'my-link', 'data-url': props.url }, slots.default?.());
			},
		});
		const w = render('[**x**](https://example.com)', { components: { link: Link } });
		expect(w.get('.my-link').attributes('data-url')).toBe('https://example.com');
		expect(w.get('.my-link b').text()).toBe('x');
	});
});

describe('provideMfmConfig', () => {
	it('子孫の<Mfm>へ設定を共有, propsの指定優先', () => {
		const Parent = defineComponent({
			setup() {
				provideMfmConfig({
					instanceUrl: 'https://a.example',
					customEmojis: { em: 'from-config' },
				} satisfies MfmOptions);
				return () => [
					h(Mfm, { text: '@x :em:' }),
					h(Mfm, { text: '@y', instanceUrl: 'https://b.example' }),
				];
			},
		});
		const w = mount(Parent);
		const mentions = w.findAll('a.mfm-mention');
		expect(defined(mentions[0]).attributes('href')).toBe('https://a.example/@x');
		expect(defined(mentions[1]).attributes('href')).toBe('https://b.example/@y');
		expect(w.get('img.mfm-custom-emoji').attributes('src')).toBe('from-config');
	});
});

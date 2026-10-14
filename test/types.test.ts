import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import type { MfmComponents, MfmOptions } from '../src/index.js';

// vue-tsc検査
describe('MfmComponents, MfmOptionsの型', () => {
	it('propsの一部のみ宣言したコンポーネントを許可', () => {
		const Partial = defineComponent({
			props: { url: { type: String, required: true } },
			setup: (props) => () => h('a', { href: props.url }),
		});
		const components: Partial<MfmComponents> = { url: Partial };
		expect(components.url).toBe(Partial);
	});

	it('型の異なるprops宣言を拒否', () => {
		const Wrong = defineComponent({
			props: { url: { type: Number, required: true } },
			setup: () => () => null,
		});
		// @ts-expect-error urlはstring
		const components: Partial<MfmComponents> = { url: Wrong };
		expect(components).toBeDefined();
	});

	it('未定義のオプション名を拒否', () => {
		// @ts-expect-error 存在しない項目
		const options: MfmOptions = { unknownOption: true };
		expect(options).toBeDefined();
	});
});

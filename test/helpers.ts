import { mount } from '@vue/test-utils';
import { Mfm } from '../src/index.js';

export type MfmProps = InstanceType<typeof Mfm>['$props'];

export function render(text: string, props: Partial<MfmProps> = {}) {
	return mount(Mfm, { props: { text, ...props } });
}

// 関数構文の最外要素
export function renderFn(text: string, props: Partial<MfmProps> = {}) {
	return render(text, props).get('span.mfm > span');
}

export function fnStyle(text: string, props: Partial<MfmProps> = {}) {
	return renderFn(text, props).attributes('style') ?? '';
}

// 未定義時はテスト失敗
export function defined<T>(value: T | null | undefined): T {
	if (value == null) throw new Error('Expected a defined value');
	return value;
}

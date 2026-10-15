import { createApp, h } from 'vue';
import { Mfm } from '../../src/index.js';
import type { MfmOptions } from '../../src/index.js';

declare global {
	interface Window {
		__MFM_COMPARE__: {
			text: string;
			options: MfmOptions;
			container: Record<string, string>;
			rootStyle: Record<string, string>;
		};
	}
}

const { text, options, container, rootStyle } = window.__MFM_COMPARE__;
const el = document.getElementById('app');
if (!el) throw new Error('#app not found');
Object.assign(el.style, container);
createApp({
	render: () => h(Mfm, { text, ...options, style: rootStyle }),
}).mount(el);

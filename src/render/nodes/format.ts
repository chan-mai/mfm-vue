import { h } from 'vue';
import type { NodeRendererMap } from '../types.js';

export const formatRenderers = {
	bold: (node, state) => h('b', state.renderNodes(node.children)),
	strike: (node, state) => h('del', state.renderNodes(node.children)),
	italic: (node, state) =>
		h('i', { class: 'mfm-italic' }, state.renderNodes(node.children)),
	small: (node, state) =>
		h('small', { class: 'mfm-small' }, state.renderNodes(node.children)),
	center: (node, state) =>
		h('div', { class: 'mfm-center' }, state.renderNodes(node.children)),
	quote: (node, state) =>
		h(
			state.ctx.nowrap ? 'span' : 'div',
			{ class: 'mfm-quote' },
			state.renderNodes(node.children, { noNyaize: true }),
		),
} satisfies Partial<NodeRendererMap>;

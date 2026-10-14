import { h } from 'vue';
import { nyaize } from '../../utils.js';
import type { VNodeChild } from 'vue';
import type { NodeRenderState, NodeRendererMap } from '../types.js';

export function transformText(text: string, state: NodeRenderState): string {
	return !state.noNyaize && state.ctx.options.nyaize ? nyaize(text) : text;
}

export const textRenderers = {
	text: (node, state) => {
		const text = transformText(node.props.text.replace(/\r\n?/g, '\n'), state);
		if (state.ctx.plain) return text.replace(/\n/g, ' ');
		const out: VNodeChild[] = [];
		text.split('\n').forEach((line, i) => {
			if (i > 0) out.push(h('br'));
			if (line !== '') out.push(line);
		});
		return out;
	},
	plain: (node, state) =>
		h('span', state.renderNodes(node.children, { noNyaize: true })),
} satisfies Partial<NodeRendererMap>;

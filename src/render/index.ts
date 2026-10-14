import { codeRenderers } from './nodes/code.js';
import { emojiRenderers } from './nodes/emoji.js';
import { fnRenderers } from './nodes/fn.js';
import { formatRenderers } from './nodes/format.js';
import { linkRenderers } from './nodes/link.js';
import { searchRenderers } from './nodes/search.js';
import { textRenderers } from './nodes/text.js';
import type { MfmNode } from 'mfm-js';
import type { VNodeChild } from 'vue';
import type {
	MfmRenderContext,
	NodeRenderer,
	NodeRenderState,
	NodeRendererMap,
} from './types.js';

export type { MfmRenderContext } from './types.js';

const renderers: NodeRendererMap = {
	...textRenderers,
	...formatRenderers,
	...linkRenderers,
	...emojiRenderers,
	...codeRenderers,
	...searchRenderers,
	...fnRenderers,
};

export function renderMfmNodes(
	nodes: readonly MfmNode[],
	ctx: MfmRenderContext,
	scale = ctx.options.rootScale,
	noNyaize = false,
): VNodeChild[] {
	const state: NodeRenderState = {
		ctx,
		scale,
		noNyaize,
		renderNodes: (children, overrides) =>
			renderMfmNodes(
				children,
				ctx,
				overrides?.scale ?? scale,
				overrides?.noNyaize ?? noNyaize,
			),
	};
	const out: VNodeChild[] = [];
	for (const node of nodes) {
		const result = renderNode(node, state);
		if (Array.isArray(result)) out.push(...result);
		else if (result != null) out.push(result);
	}
	return out;
}

function renderNode(node: MfmNode, state: NodeRenderState): VNodeChild {
	const renderer = renderers[node.type] as NodeRenderer<MfmNode> | undefined;
	if (renderer) return renderer(node, state);
	// 未知ノード種別は描画なし
	console.error(`[mfm-vue] Unrecognized node type: ${node.type}`);
	return null;
}

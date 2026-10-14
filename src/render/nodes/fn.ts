import { h } from 'vue';
import { renderComponent } from '../component.js';
import { transformText } from './text.js';
import type { MfmFnContext } from '../../types/index.js';
import type { NodeRendererMap } from '../types.js';

export const fnRenderers = {
	fn: (node, state) => {
		const { ctx, scale } = state;
		const { name, args } = node.props;
		const fnCtx: MfmFnContext = {
			name,
			args,
			node,
			scale,
			options: ctx.options,
			renderChildren: (s = scale) =>
				state.renderNodes(node.children, { scale: s }),
			renderNodes: (nodes, s = scale) => state.renderNodes(nodes, { scale: s }),
			transformText: (text) => transformText(text, state),
			renderComponent: (componentName, props, children) =>
				renderComponent(ctx, componentName, props, children),
			emitClick: ctx.emitClick,
		};
		const handler = ctx.options.fns[name];
		const result = handler ? handler(fnCtx) : null;
		if (result != null) return result;
		// 未知の関数は元記法で表示
		return h('span', ['$[', name, ' ', ...fnCtx.renderChildren(), ']']);
	},
} satisfies Partial<NodeRendererMap>;

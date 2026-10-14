import { renderComponent } from '../component.js';
import type { NodeRendererMap } from '../types.js';

export const searchRenderers = {
	search: (node, { ctx }) =>
		renderComponent(ctx, 'search', {
			query: node.props.query,
			content: node.props.content,
		}),
} satisfies Partial<NodeRendererMap>;

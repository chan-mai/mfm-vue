import { renderComponent } from '../component.js';
import type { NodeRendererMap } from '../types.js';

export const codeRenderers = {
	inlineCode: (node, { ctx }) =>
		renderComponent(ctx, 'inlineCode', { code: node.props.code }),
	blockCode: (node, { ctx }) =>
		renderComponent(ctx, 'blockCode', {
			code: node.props.code,
			lang: node.props.lang,
		}),
	mathInline: (node, { ctx }) =>
		renderComponent(ctx, 'mathInline', { formula: node.props.formula }),
	mathBlock: (node, { ctx }) =>
		renderComponent(ctx, 'mathBlock', { formula: node.props.formula }),
} satisfies Partial<NodeRendererMap>;

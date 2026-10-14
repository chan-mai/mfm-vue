import { h } from 'vue';
import type { VNodeChild } from 'vue';
import type { MfmComponentName, MfmComponentPropsMap } from '../types/index.js';
import type { MfmRenderContext } from './types.js';

// スロット優先, なければcomponents
export function renderComponent<K extends MfmComponentName>(
	ctx: MfmRenderContext,
	name: K,
	props: MfmComponentPropsMap[K],
	children?: VNodeChild[],
): VNodeChild {
	const slot = (ctx.slots as Record<string, unknown>)[name] as
		((p: MfmComponentPropsMap[K]) => VNodeChild) | undefined;
	if (slot) return slot(props);
	const component = ctx.options.components[name];
	return children
		? h(component, props, { default: () => children })
		: h(component, props);
}

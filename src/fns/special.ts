import { h } from 'vue';
import { childText } from './helpers.js';
import type { MfmFnHandler } from '../types/index.js';

export const specialFns = {
	ruby: (ctx) => {
		const { children } = ctx.node;
		if (children.length === 1) {
			const [base, rt] = ctx.transformText(childText(ctx, 0)).split(' ');
			return h('ruby', [base, h('rt', rt)]);
		}
		return h('ruby', [
			...ctx.renderNodes(children.slice(0, -1)),
			h('rt', ctx.transformText(childText(ctx, -1)).trim()),
		]);
	},
	unixtime: (ctx) => {
		const sec = Number.parseInt(childText(ctx, 0), 10);
		return ctx.renderComponent('unixtime', { time: sec * 1000 });
	},
	clickable: (ctx) => {
		const ev = typeof ctx.args.ev === 'string' ? ctx.args.ev : '';
		return h(
			'span',
			{
				class: 'mfm-clickable',
				onClick: (event: Event) => {
					event.stopPropagation();
					event.preventDefault();
					ctx.emitClick(ev);
				},
			},
			ctx.renderChildren(),
		);
	},
} satisfies Record<string, MfmFnHandler>;

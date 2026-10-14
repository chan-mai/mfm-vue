import { h } from 'vue';
import { safeParseFloat } from '../utils.js';
import { fnSpan } from './helpers.js';
import type { MfmFnHandler } from '../types/index.js';

function zoom(factor: 2 | 3 | 4): MfmFnHandler {
	return (ctx) =>
		h(
			'span',
			{ class: ctx.options.advanced ? `mfm-x${factor}` : undefined },
			ctx.renderChildren(ctx.scale * factor),
		);
}

export const transformFns = {
	flip: (ctx) => {
		const { h: horizontal, v: vertical } = ctx.args;
		const transform =
			horizontal && vertical
				? 'scale(-1, -1)'
				: vertical
					? 'scaleY(-1)'
					: 'scaleX(-1)';
		return fnSpan(ctx, { style: { transform } });
	},
	x2: zoom(2),
	x3: zoom(3),
	x4: zoom(4),
	rotate: (ctx) => {
		const deg = safeParseFloat(ctx.args.deg) ?? 90;
		return fnSpan(ctx, {
			class: ['mfm-fn-rotate'],
			style: { transform: `rotate(${deg}deg)` },
		});
	},
	position: (ctx) => {
		if (!ctx.options.advanced) return fnSpan(ctx);
		const x = safeParseFloat(ctx.args.x) ?? 0;
		const y = safeParseFloat(ctx.args.y) ?? 0;
		return fnSpan(ctx, {
			style: { transform: `translateX(${x}em) translateY(${y}em)` },
		});
	},
	scale: (ctx) => {
		if (!ctx.options.advanced) return fnSpan(ctx);
		const x = Math.min(safeParseFloat(ctx.args.x) ?? 1, 5);
		const y = Math.min(safeParseFloat(ctx.args.y) ?? 1, 5);
		return fnSpan(
			ctx,
			{ style: { transform: `scale(${x}, ${y})` } },
			ctx.renderChildren(ctx.scale * Math.max(x, y)),
		);
	},
} satisfies Record<string, MfmFnHandler>;

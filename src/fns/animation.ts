import { h } from 'vue';
import { animationAttrs, fnSpan, useAnimation } from './helpers.js';
import type { MfmFnHandler } from '../types/index.js';

function simple(animation: string): MfmFnHandler {
	return (ctx) => fnSpan(ctx, animationAttrs(ctx, animation));
}

export const animationFns = {
	tada: (ctx) => {
		const attrs = animationAttrs(ctx, 'tada');
		return fnSpan(ctx, {
			...attrs,
			class: ['mfm-fn-tada', ...(attrs.class ?? [])],
		});
	},
	jelly: simple('jelly'),
	twitch: simple('twitch'),
	shake: simple('shake'),
	jump: simple('jump'),
	bounce: simple('bounce'),
	spin: (ctx) => {
		const { args } = ctx;
		const animation = args.x ? 'spin-x' : args.y ? 'spin-y' : 'spin';
		const direction = args.left
			? 'reverse'
			: args.alternate
				? 'alternate'
				: null;
		return fnSpan(
			ctx,
			animationAttrs(
				ctx,
				animation,
				direction ? { animationDirection: direction } : {},
			),
		);
	},
	rainbow: (ctx) => {
		if (!useAnimation(ctx)) {
			return h('span', { class: 'mfm-rainbow-fallback' }, ctx.renderChildren());
		}
		return fnSpan(ctx, animationAttrs(ctx, 'rainbow'));
	},
	sparkle: (ctx) => {
		const children = ctx.renderChildren();
		if (!useAnimation(ctx)) return h('span', children);
		return ctx.renderComponent('sparkle', {}, children);
	},
} satisfies Record<string, MfmFnHandler>;

import { h } from 'vue';
import { validTime } from '../utils.js';
import type { VNodeChild } from 'vue';
import type { MfmFnContext } from '../types/index.js';

export interface FnSpanAttrs {
	class?: string[];
	style?: Record<string, string>;
}

export function useAnimation(ctx: MfmFnContext): boolean {
	return ctx.options.advanced && ctx.options.animated;
}

// inline-blockの関数要素
export function fnSpan(
	ctx: MfmFnContext,
	attrs: FnSpanAttrs = {},
	children: VNodeChild[] = ctx.renderChildren(),
) {
	const { style } = attrs;
	return h(
		'span',
		{
			class: ['mfm-fn', ...(attrs.class ?? [])],
			style: style && Object.keys(style).length > 0 ? style : undefined,
		},
		children,
	);
}

// キーフレームクラス, 速度/遅延のみinline
export function animationAttrs(
	ctx: MfmFnContext,
	animation: string,
	style: Record<string, string> = {},
): FnSpanAttrs {
	if (!useAnimation(ctx)) return {};
	const speed = validTime(ctx.args.speed);
	const delay = validTime(ctx.args.delay);
	return {
		class: [`mfm-anim-${animation}`],
		style: {
			...(speed ? { animationDuration: speed } : {}),
			...(delay ? { animationDelay: delay } : {}),
			...style,
		},
	};
}

export function childText(ctx: MfmFnContext, index: number): string {
	const child = ctx.node.children.at(index);
	return child?.type === 'text' ? child.props.text : '';
}

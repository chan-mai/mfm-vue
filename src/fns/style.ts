import { h } from 'vue';
import { safeParseFloat, validColor } from '../utils.js';
import { fnSpan } from './helpers.js';
import type { MfmFnContext, MfmFnHandler } from '../types/index.js';

const BORDER_STYLES = new Set([
	'hidden',
	'dotted',
	'dashed',
	'solid',
	'double',
	'groove',
	'ridge',
	'inset',
	'outset',
]);

const FONT_FAMILIES = [
	'serif',
	'monospace',
	'cursive',
	'fantasy',
	'emoji',
	'math',
] as const;

function colorFn(ctx: MfmFnContext, prop: 'color' | 'backgroundColor') {
	const color = validColor(ctx.args.color) ?? 'f00';
	return fnSpan(ctx, {
		class: ['mfm-fn-color'],
		style: { [prop]: `#${color}` },
	});
}

export const styleFns = {
	font: (ctx) => {
		const family = FONT_FAMILIES.find((f) => ctx.args[f]);
		return family ? fnSpan(ctx, { style: { fontFamily: family } }) : null;
	},
	blur: (ctx) => h('span', { class: 'mfm-blur' }, ctx.renderChildren()),
	fg: (ctx) => colorFn(ctx, 'color'),
	bg: (ctx) => colorFn(ctx, 'backgroundColor'),
	border: (ctx) => {
		const { args } = ctx;
		const color = validColor(args.color);
		const style =
			typeof args.style === 'string' && BORDER_STYLES.has(args.style)
				? args.style
				: 'solid';
		const width = safeParseFloat(args.width) ?? 1;
		const radius = safeParseFloat(args.radius) ?? 0;
		return fnSpan(ctx, {
			class: ['mfm-fn-border', ...(args.noclip ? [] : ['mfm-fn-clip'])],
			style: {
				borderWidth: `${width}px`,
				borderStyle: style,
				borderRadius: `${radius}px`,
				...(color ? { borderColor: `#${color}` } : {}),
			},
		});
	},
} satisfies Record<string, MfmFnHandler>;

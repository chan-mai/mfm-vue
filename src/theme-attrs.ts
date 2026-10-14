import tinycolor from 'tinycolor2';
import { themeVars } from './theme.js';
import type { MfmCompiledTheme, ResolvedMfmOptions } from './types/index.js';

// 色以外の値はライトを優先
function mergeAuto(
	light: MfmCompiledTheme,
	dark: MfmCompiledTheme,
): MfmCompiledTheme {
	const result: MfmCompiledTheme = {};
	for (const key of new Set([...Object.keys(light), ...Object.keys(dark)])) {
		const l = light[key];
		const d = dark[key];
		if (l == null || d == null || l === d) {
			const value = l ?? d;
			if (value != null) result[key] = value;
		} else if (tinycolor(l).isValid() && tinycolor(d).isValid()) {
			result[key] = `light-dark(${l}, ${d})`;
		} else {
			result[key] = l;
		}
	}
	return result;
}

// html要素同様, 文字色とcolor-schemeも設定
export function themeAttrs(options: ResolvedMfmOptions): {
	class: string;
	style: Record<string, string>;
} {
	const { colorScheme, lightTheme, darkTheme } = options;
	let colors: MfmCompiledTheme;
	let scheme: string;
	if (colorScheme === 'auto') {
		colors = mergeAuto(lightTheme?.colors ?? {}, darkTheme?.colors ?? {});
		scheme = 'light dark';
	} else {
		const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
		colors = theme?.colors ?? {};
		scheme = theme?.colorScheme ?? colorScheme;
	}
	return {
		class: `mfm-scheme-${colorScheme}`,
		style: {
			...themeVars(colors),
			'color-scheme': scheme,
			...(colors.fg ? { color: 'var(--mfm-theme-fg)' } : {}),
		},
	};
}

import JSON5 from 'json5';
import tinycolor from 'tinycolor2';
import type {
	MfmCodeTheme,
	MfmCompiledTheme,
	MfmTheme,
	ResolvedMfmTheme,
} from './types/index.js';

const MAX_THEME_REFERENCE_DEPTH = 8;

// Misskeyの_light, _darkと同値
const ACCENT_DEFAULTS = {
	focus: ':alpha<0.3<@accent',
	fgOnAccent: '#fff',
};

// id: lightのデフォテーマの項目からX始まりを除外
export function getThemeProps(baseThemes: readonly MfmTheme[]): string[] | null {
	const light = baseThemes.find((t) => t.id === 'light');
	return light ? Object.keys(light.props).filter((key) => !key.startsWith('X')) : null;
}

function getThemeReferenceColor(
	theme: MfmTheme,
	key: string,
	stack: string[],
	depth: number,
): tinycolor.Instance {
	if (depth >= MAX_THEME_REFERENCE_DEPTH) {
		throw new Error('Theme reference limit exceeded');
	}
	if (stack.includes(key)) {
		throw new Error('Theme contains circular references');
	}
	const next = theme.props[key];
	if (typeof next !== 'string') {
		throw new Error(`Theme references missing property: ${key}`);
	}
	return getColor(theme, next, [...stack, key], depth + 1);
}

// @参照, $定数, :関数<引数<色
function getColor(
	theme: MfmTheme,
	value: string,
	stack: string[] = [],
	depth = 0,
): tinycolor.Instance {
	if (value[0] === '@') {
		return getThemeReferenceColor(theme, value.substring(1), stack, depth);
	}
	if (value[0] === '$') {
		return getThemeReferenceColor(theme, value, stack, depth);
	}
	if (value[0] === ':') {
		if (depth >= MAX_THEME_REFERENCE_DEPTH) {
			throw new Error('Theme reference limit exceeded');
		}
		const parts = value.split('<');
		const funcText = parts.shift();
		const argText = parts.shift();
		if (funcText && argText) {
			const func = funcText.substring(1);
			const arg = Number.parseFloat(argText);
			const color = getColor(theme, parts.join('<'), stack, depth + 1);
			switch (func) {
				case 'darken':
					return color.darken(arg);
				case 'lighten':
					return color.lighten(arg);
				case 'alpha':
					return color.setAlpha(arg);
				case 'hue':
					return color.spin(arg);
				case 'saturate':
					return color.saturate(arg);
			}
		}
	}
	return tinycolor(value);
}

// themeProps未指定時は全項目
export function compileTheme(
	theme: MfmTheme,
	themeProps: readonly string[] | null = null,
): MfmCompiledTheme {
	const props: MfmCompiledTheme = {};
	for (const [key, value] of Object.entries(theme.props)) {
		if (key.startsWith('$')) continue;
		props[key] = value.startsWith('"')
			? value.replace(/^"\s*/, '')
			: getColor(theme, value).toRgbString();
	}
	if (!themeProps) return props;
	return Object.fromEntries(
		Object.entries(props).filter(([key]) => themeProps.includes(key)),
	);
}

function findBaseTheme(
	theme: MfmTheme,
	baseThemes: readonly MfmTheme[],
): MfmTheme | undefined {
	return theme.base != null
		? baseThemes.find((t) => t.id === theme.base)
		: undefined;
}

// baseと同じidのデフォテーマへ重ねて合成
export function withBaseTheme(
	theme: MfmTheme,
	baseThemes: readonly MfmTheme[],
): MfmTheme {
	const base = findBaseTheme(theme, baseThemes);
	return base ? { ...theme, props: { ...base.props, ...theme.props } } : theme;
}

// MisskeyのparseThemeCodeと同じ検証
export function parseThemeCode(code: string): MfmTheme {
	let theme: unknown;
	try {
		theme = JSON5.parse(code);
	} catch {
		throw new Error('Failed to parse theme json');
	}
	if (!validateTheme(theme)) throw new Error('This theme is invalid');
	return theme;
}

export function validateTheme(theme: unknown): theme is MfmTheme {
	if (theme == null || typeof theme !== 'object') return false;
	const t = theme as Record<string, unknown>;
	return (
		typeof t.id === 'string' &&
		typeof t.name === 'string' &&
		(t.base === 'light' || t.base === 'dark') &&
		t.props != null &&
		typeof t.props === 'object'
	);
}

// デフォテーマはbaseなし, JSON5解析のみ
export function parseBaseTheme(input: MfmTheme | string): MfmTheme {
	if (typeof input !== 'string') return input;
	try {
		return JSON5.parse(input) as MfmTheme;
	} catch {
		throw new Error('Failed to parse theme json');
	}
}

// デフォテーマのcodeHighlighterと合成
function resolveCodeTheme(
	theme: MfmTheme,
	mode: 'light' | 'dark',
	baseThemes: readonly MfmTheme[],
): MfmCodeTheme {
	let highlighter = theme.codeHighlighter;
	const baseTheme = findBaseTheme(theme, baseThemes);
	if (baseTheme?.codeHighlighter) {
		highlighter = {
			...baseTheme.codeHighlighter,
			...highlighter,
		} as MfmTheme['codeHighlighter'];
	}
	if (!highlighter) {
		return { base: 'dark-plus', overrides: null, name: 'dark-plus', type: mode };
	}
	const { base, overrides } = highlighter;
	// _none_はtheme.id, 同梱テーマは同梱名が既定名
	const name =
		(overrides?.name as string | undefined) ??
		(base === '_none_' ? (theme.id ?? 'custom') : base);
	return { base, overrides: overrides ?? null, name, type: mode };
}

// 未指定, 不正なテーマはnull
export function resolveTheme(
	input: MfmTheme | string | null | undefined,
	mode: 'light' | 'dark',
	baseThemes: readonly MfmTheme[] = [],
): ResolvedMfmTheme | null {
	if (input == null) return null;
	try {
		const theme = typeof input === 'string' ? parseThemeCode(input) : input;
		const merged = withBaseTheme(theme, baseThemes);
		// デフォルトテーマなしでもaccent依存の項目はデフォルトテーマと同じ定義
		const props =
			merged.props.accent != null
				? { ...ACCENT_DEFAULTS, ...merged.props }
				: merged.props;
		return {
			colors: compileTheme({ ...merged, props }, getThemeProps(baseThemes)),
			colorScheme: theme.base === 'dark' ? 'dark' : 'light',
			code: resolveCodeTheme(theme, mode, baseThemes),
		};
	} catch (error) {
		console.warn(`[mfm-vue] Invalid ${mode} theme: ${String(error)}`);
		return null;
	}
}

// テーマ未指定時のコードハイライト
export function fallbackCodeTheme(mode: 'light' | 'dark'): MfmCodeTheme {
	const base = mode === 'dark' ? 'one-dark-pro' : 'catppuccin-latte';
	return { base, overrides: null, name: base, type: mode };
}

export function themeVars(
	colors: MfmCompiledTheme,
	prefix = '--mfm-theme-',
): Record<string, string> {
	return Object.fromEntries(
		Object.entries(colors)
			.filter(([, v]) => v)
			.map(([k, v]) => [
				`${prefix}${k}`,
				v.replaceAll('var(--MI_THEME-', `var(${prefix}`),
			]),
	);
}

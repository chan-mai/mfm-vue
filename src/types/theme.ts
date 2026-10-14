// 本家テーマ定義互換
export interface MfmTheme {
	id?: string;
	name?: string;
	author?: string;
	desc?: string;
	base?: 'light' | 'dark';
	// 旧形式, デフォテーマとの合成対象外
	kind?: 'light' | 'dark';
	props: Record<string, string>;
	codeHighlighter?:
		| { base: string; overrides?: Record<string, unknown> }
		| { base: '_none_'; overrides: Record<string, unknown> };
}

// themePropsの各項目の解決済みの値
export type MfmCompiledTheme = Record<string, string>;

export interface MfmCodeTheme {
	// shikiの同梱テーマ名または_none_
	base: string;
	overrides: Record<string, unknown> | null;
	name: string;
	type: 'light' | 'dark';
}

export interface ResolvedMfmTheme {
	colors: MfmCompiledTheme;
	// テーマのbaseから決定
	colorScheme: 'light' | 'dark';
	code: MfmCodeTheme;
}

export type MfmColorScheme = 'light' | 'dark' | 'auto';

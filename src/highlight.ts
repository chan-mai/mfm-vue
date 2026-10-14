import type {
	BundledLanguage,
	BundledTheme,
	HighlighterGeneric,
	LanguageRegistration,
	ThemeRegistration,
} from 'shiki';
import type { MfmCodeTheme } from './types/index.js';

type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

export interface HighlightedToken {
	content: string;
	// --shiki-light等のCSS変数
	style: Record<string, string>;
}

export interface HighlightResult {
	lines: HighlightedToken[][];
	// --shiki-light-bg等のCSS変数
	rootStyle: Record<string, string>;
}

let highlighter: Promise<Highlighter> | null = null;

// shikiは初回利用時に読み込み
function getHighlighter() {
	highlighter ??= (async () => {
		const [{ createHighlighter, createJavaScriptRegexEngine }, aiscript] =
			await Promise.all([
				import('shiki'),
				import('aiscript-grammar'),
			]);
		return createHighlighter({
			themes: [],
			langs: [aiscript.default as unknown as LanguageRegistration],
			engine: createJavaScriptRegexEngine({ forgiving: true }),
		});
	})();
	return highlighter;
}

async function resolveLang(
	hl: Highlighter,
	lang: string,
): Promise<BundledLanguage | null> {
	if (hl.getLoadedLanguages().includes(lang)) return lang as BundledLanguage;
	const { bundledLanguagesInfo } = await import('shiki');
	const info = bundledLanguagesInfo.find(
		(l) => l.id === lang || l.aliases?.includes(lang),
	);
	if (!info) return null;
	await hl.loadLanguage(info.id as BundledLanguage);
	return info.id as BundledLanguage;
}

// リアクティブなProxyも複製可能
function jsonClone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

function isPureObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// MisskeyのdeepMergeと同等, 配列は置換
function deepMerge(
	value: Record<string, unknown>,
	def: Record<string, unknown>,
): Record<string, unknown> {
	const result: Record<string, unknown> = jsonClone(value);
	for (const [k, v] of Object.entries(def)) {
		if (!Object.hasOwn(value, k) || value[k] === undefined) {
			result[k] = v;
		} else if (isPureObject(v) && isPureObject(result[k])) {
			result[k] = deepMerge(result[k] as Record<string, unknown>, v);
		}
	}
	return result;
}

function hashKey(text: string): string {
	let h = 5381;
	for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
	return (h >>> 0).toString(36);
}

// 名前は重複回避用の内部名
async function ensureTheme(hl: Highlighter, theme: MfmCodeTheme): Promise<string> {
	const name = `mfm-${theme.type}-${hashKey(JSON.stringify(theme))}`;
	if (hl.getLoadedThemes().includes(name)) return name;
	let registration: Record<string, unknown>;
	if (theme.base === '_none_') {
		registration = jsonClone(theme.overrides ?? {});
	} else {
		const { bundledThemes } = await import('shiki');
		const loader = bundledThemes[(theme.base in bundledThemes ? theme.base : 'dark-plus') as BundledTheme];
		const base = (await loader()).default as unknown as Record<string, unknown>;
		registration = deepMerge(theme.overrides ?? {}, base);
	}
	await hl.loadTheme({
		...registration,
		name,
		type: theme.type,
	} as unknown as ThemeRegistration);
	return name;
}

function parseStyle(style: string | false | undefined): Record<string, string> {
	if (!style) return {};
	return Object.fromEntries(
		style
			.split(';')
			.filter(Boolean)
			.map((decl) => {
				const i = decl.indexOf(':');
				return [decl.slice(0, i).trim(), decl.slice(i + 1).trim()];
			}),
	);
}

// ライト, ダーク両テーマの色をCSS変数で出力
export async function highlightCode(
	code: string,
	lang: string | null,
	options: { light: MfmCodeTheme; dark: MfmCodeTheme; defaultLang: string },
): Promise<HighlightResult> {
	const hl = await getHighlighter();
	const [light, dark] = await Promise.all([
		ensureTheme(hl, options.light),
		ensureTheme(hl, options.dark),
	]);
	const resolved =
		(lang ? await resolveLang(hl, lang) : null) ??
		(await resolveLang(hl, options.defaultLang)) ??
		('text' as BundledLanguage);
	const result = hl.codeToTokens(code, {
		lang: resolved,
		themes: {
			light: light as BundledTheme,
			dark: dark as BundledTheme,
		},
		defaultColor: false,
	});
	return {
		lines: result.tokens.map((line) =>
			line.map((t) => ({ content: t.content, style: t.htmlStyle ?? {} })),
		),
		rootStyle: parseStyle(result.rootStyle),
	};
}

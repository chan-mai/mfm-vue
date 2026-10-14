import { inject, provide, toValue } from 'vue';
import { defaultComponents } from './components/defaults/index.js';
import { builtinFns } from './fns/index.js';
import { createFluentEmojiResolver, createTwemojiResolver } from './emoji.js';
import { resolveMessages } from './i18n/index.js';
import { parseBaseTheme, resolveTheme } from './theme.js';
import { getHost } from './utils.js';
import type { InjectionKey, MaybeRefOrGetter } from 'vue';
import type {
	MfmEmojiStyle,
	MfmMessagesInput,
	MfmOptions,
	MfmTheme,
	ResolvedMfmOptions,
} from './types/index.js';

export const mfmConfigKey: InjectionKey<() => MfmOptions> =
	Symbol('mfm-config');

// undefined項目を上書きしない
export function mergeMfmOptions(
	...sources: (MfmOptions | null | undefined)[]
): MfmOptions {
	const result: MfmOptions = {};
	for (const source of sources) {
		if (!source) continue;
		for (const [key, value] of Object.entries(source)) {
			if (value === undefined) continue;
			if (key === 'messages') {
				const prev = result.messages;
				const next = value as MfmMessagesInput;
				result.messages = {
					...prev,
					...next,
					ago: { ...prev?.ago, ...next.ago },
					timeIn: { ...prev?.timeIn, ...next.timeIn },
				};
			} else if (
				key === 'components' ||
				key === 'fns' ||
				key === 'paths' ||
				key === 'dataSaver'
			) {
				(result as Record<string, unknown>)[key] = {
					...(result[key] as object | undefined),
					...(value as object),
				};
			} else {
				(result as Record<string, unknown>)[key] = value;
			}
		}
	}
	return result;
}

function parseBaseThemes(input: MfmOptions['baseThemes']): MfmTheme[] {
	const result: MfmTheme[] = [];
	for (const t of input ?? []) {
		try {
			result.push(parseBaseTheme(t));
		} catch (error) {
			console.warn(`[mfm-vue] Invalid base theme: ${String(error)}`);
		}
	}
	return result;
}

type ResolvedThemes = Pick<
	ResolvedMfmOptions,
	'baseThemes' | 'lightTheme' | 'darkTheme'
>;

const THEME_CACHE_SIZE = 32;
const themeCache = new Map<string, ResolvedThemes>();

function themeKey(input: MfmTheme | string | null | undefined): string {
	return typeof input === 'string' ? input : JSON.stringify(input ?? null);
}

// 同一入力の<Mfm>間で解決結果を共有
function resolveThemes(options: MfmOptions): ResolvedThemes {
	const key = [options.lightTheme, options.darkTheme, ...(options.baseThemes ?? [])]
		.map(themeKey)
		.join('\0');
	const cached = themeCache.get(key);
	if (cached) return cached;
	const baseThemes = parseBaseThemes(options.baseThemes);
	const result = {
		baseThemes,
		lightTheme: resolveTheme(options.lightTheme, 'light', baseThemes),
		darkTheme: resolveTheme(options.darkTheme, 'dark', baseThemes),
	};
	if (themeCache.size >= THEME_CACHE_SIZE) {
		const oldest = themeCache.keys().next().value;
		if (oldest != null) themeCache.delete(oldest);
	}
	themeCache.set(key, result);
	return result;
}

function unicodeEmojiResolver(
	style: MfmEmojiStyle,
	base: string,
): ((emoji: string) => string) | null {
	if (style === 'native') return null;
	return style === 'fluentEmoji'
		? createFluentEmojiResolver(base)
		: createTwemojiResolver(base);
}

// 空文字列はnull
function trimTrailingSlash(url: string | null | undefined): string | null {
	const trimmed = url?.replace(/\/+$/, '');
	if (!trimmed) return null;
	return trimmed;
}

export function resolveMfmOptions(options: MfmOptions): ResolvedMfmOptions {
	const instanceUrl = trimTrailingSlash(options.instanceUrl);
	// SSR と結果を揃えるため実行環境の言語は参照しない
	const locale = options.locale ?? 'en-US';
	const themes = resolveThemes(options);
	return {
		instanceUrl,
		sourceHost: getHost(instanceUrl),
		author: options.author ?? null,
		emojiUrls: options.emojiUrls ?? null,
		customEmojis: options.customEmojis ?? null,
		unicodeEmojiUrl:
			options.unicodeEmojiUrl === undefined
				? unicodeEmojiResolver(options.emojiStyle ?? 'twemoji', instanceUrl ?? '')
				: options.unicodeEmojiUrl,
		advanced: options.advanced ?? true,
		animated: options.animated !== false,
		motionAuto: (options.animated ?? 'auto') === 'auto',
		isNote: options.isNote ?? true,
		nyaize:
			options.nyaize === 'respect'
				? options.author?.isCat === true
				: options.nyaize === true,
		rootScale: options.rootScale ?? 1,
		components: { ...defaultComponents, ...options.components },
		fns: { ...builtinFns, ...options.fns },
		onClickEv: options.onClickEv ?? null,
		source: options,
		locale,
		messages: resolveMessages(locale, options.messages),
		highlight:
			options.highlight === false
				? false
				: {
					defaultLang: 'js',
					...(typeof options.highlight === 'object' ? options.highlight : {}),
				},
		me: options.me ?? null,
		urlPreview: options.urlPreview ?? null,
		userPreview: options.userPreview ?? null,
		colorScheme: options.colorScheme ?? 'light',
		...themes,
		dataSaver: {
			avatar: options.dataSaver?.avatar ?? false,
			urlPreviewThumbnail: options.dataSaver?.urlPreviewThumbnail ?? false,
			code: options.dataSaver?.code ?? false,
		},
		navigate: options.navigate ?? null,
		paths: {
			user: options.paths?.user ?? ((acct) => `/${acct}`),
			hashtag:
				options.paths?.hashtag ??
				((tag, isNote) =>
					`/${isNote ? 'tags' : 'user-tags'}/${encodeURIComponent(tag)}`),
		},
		onCopy: options.onCopy ?? null,
		searchEngine:
			options.searchEngine ?? 'https://www.google.com/search?q={query}',
		mediaProxy: trimTrailingSlash(options.mediaProxy),
		disableAnimatedImages: options.disableAnimatedImages ?? false,
	};
}

// 子孫の<Mfm>へ設定を共有, 親設定とマージ
export function provideMfmConfig(config: MaybeRefOrGetter<MfmOptions>): void {
	const parent = inject(mfmConfigKey, null);
	provide(mfmConfigKey, () =>
		mergeMfmOptions(parent?.(), toValue(config)),
	);
}

export function useMfmConfig(): () => MfmOptions {
	return inject(mfmConfigKey, () => ({}));
}

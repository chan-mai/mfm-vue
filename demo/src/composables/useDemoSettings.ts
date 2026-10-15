import { reactive } from 'vue';
import { SAMPLES } from '../data/samples';
import type { MfmColorScheme, MfmEmojiStyle } from 'mfm-vue';

export const SEARCH_ENGINES = {
	Google: 'https://www.google.com/search?q={query}',
	DuckDuckGo: 'https://duckduckgo.com/?q={query}',
	Bing: 'https://www.bing.com/search?q={query}',
} as const;

export const FONT_SIZES = [14, 15, 16, 17] as const;

export type EmojiSource = 'endpoint' | 'api' | 'none';

const settings = reactive({
	text: SAMPLES[0]?.text ?? '',
	instanceUrl: 'https://misskey.io',
	locale: 'ja-JP',
	advanced: true,
	animated: 'auto' as 'auto' | 'on' | 'off',
	plain: false,
	nowrap: false,
	isCat: false,
	fontSize: 14 as (typeof FONT_SIZES)[number],
	colorScheme: 'light' as MfmColorScheme,
	emojiStyle: 'twemoji' as MfmEmojiStyle,
	emojiSource: 'endpoint' as EmojiSource,
	me: '',
	mediaProxy: '',
	disableAnimatedImages: false,
	highlight: true,
	urlPreview: true,
	userPreview: true,
	navigate: true,
	customHashtag: false,
	searchEngine: 'Google' as keyof typeof SEARCH_ENGINES,
	dataSaverCode: false,
	dataSaverThumbnail: false,
	misskeyTag: '2026.10.0',
	lightThemeCode: '',
	darkThemeCode: '',
});

export function useDemoSettings() {
	return settings;
}

export function proxyEndpoint(path: 'emojis' | 'url' | 'users-show'): string {
	return `/api/${path}?instance=${encodeURIComponent(settings.instanceUrl)}`;
}

import type { MfmCustomEmojiResolver } from './types/index.js';

// /emoji/<name>.webpのURL生成
export function createInstanceEmojiResolver(
	instanceUrl: string,
): MfmCustomEmojiResolver {
	const base = instanceUrl.replace(/\/+$/, '');
	return (name, host) => {
		const id = host
			? `${encodeURIComponent(name)}@${encodeURIComponent(host)}`
			: encodeURIComponent(name);
		return `${base}/emoji/${id}.webp`;
	};
}

// ZWJなしの場合はFE0F除去
export function twemojiFileName(emoji: string): string {
	const codes = Array.from(emoji, (c) => (c.codePointAt(0) ?? 0).toString(16));
	const filtered = codes.includes('200d')
		? codes
		: codes.filter((c) => c !== 'fe0f');
	return filtered.join('-');
}

// instanceUrlが空文字の場合はルート相対
export function createTwemojiResolver(
	instanceUrl: string,
): (emoji: string) => string {
	const base = instanceUrl.replace(/\/+$/, '');
	return (emoji) => `${base}/twemoji/${twemojiFileName(emoji)}.svg`;
}

// 国旗は非対応 Twemojiで代替
export function createFluentEmojiResolver(
	instanceUrl: string,
): (emoji: string) => string {
	const base = instanceUrl.replace(/\/+$/, '');
	const twemoji = createTwemojiResolver(base);
	return (emoji) =>
		(emoji.codePointAt(0) ?? 0).toString(16).startsWith('1f1')
			? twemoji(emoji)
			: `${base}/fluent-emoji/${twemojiFileName(emoji)}.png`;
}

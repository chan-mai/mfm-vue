import { h } from 'vue';
import { proxiedImageUrl, staticImageUrl } from '../../media.js';
import { renderComponent } from '../component.js';
import { resolveHost } from '../host.js';
import type { ResolvedMfmOptions } from '../../types/index.js';
import type { NodeRendererMap } from '../types.js';

// false 文字列表示
function resolveEmojiUrl(
	name: string,
	host: string | null,
	options: ResolvedMfmOptions,
): string | null | false {
	const fromNote = options.emojiUrls?.[name];
	if (fromNote) return fromNote;
	// ノート付属の絵文字情報にないリモート絵文字
	if (host != null && options.emojiUrls) return false;
	const custom = options.customEmojis;
	if (typeof custom === 'function') return custom(name, host) ?? null;
	if (custom && host == null) return custom[name] ?? null;
	return null;
}

// /emoji/経由以外はメディアプロキシ経由
function displayEmojiUrl(
	url: string,
	isSourceHost: boolean,
	useOriginalSize: boolean,
	options: ResolvedMfmOptions,
): string {
	const { mediaProxy, instanceUrl } = options;
	if (!mediaProxy) return url;
	const viaEndpoint =
		url.startsWith('/emoji/') ||
		(instanceUrl != null && url.startsWith(`${instanceUrl}/emoji/`));
	const proxied =
		viaEndpoint || (useOriginalSize && isSourceHost)
			? url
			: proxiedImageUrl(mediaProxy, url, useOriginalSize ? undefined : 'emoji', true);
	return options.disableAnimatedImages
		? staticImageUrl(mediaProxy, instanceUrl, proxied)
		: proxied;
}

export const emojiRenderers = {
	emojiCode: (node, { ctx, scale }) => {
		const { name } = node.props;
		const { host, isSourceHost } = resolveHost(null, ctx.options);
		const url = resolveEmojiUrl(name, isSourceHost ? null : host, ctx.options);
		if (url === false) return h('span', `:${name}:`);
		const useOriginalSize = scale >= 2.5;
		return renderComponent(ctx, 'customEmoji', {
			name,
			host,
			isSourceHost,
			url: url && displayEmojiUrl(url, isSourceHost, useOriginalSize, ctx.options),
			normal: ctx.plain,
			useOriginalSize,
		});
	},
	unicodeEmoji: (node, { ctx }) =>
		renderComponent(ctx, 'unicodeEmoji', {
			emoji: node.props.emoji,
			url: ctx.options.unicodeEmojiUrl?.(node.props.emoji) ?? null,
		}),
} satisfies Partial<NodeRendererMap>;

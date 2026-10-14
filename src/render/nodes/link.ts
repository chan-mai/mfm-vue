import { h } from 'vue';
import { staticImageUrl } from '../../media.js';
import { getOrigin, isSafeUrl } from '../../utils.js';
import { renderComponent } from '../component.js';
import { resolveHost } from '../host.js';
import type { ResolvedMfmOptions } from '../../types/index.js';
import type { NodeRendererMap } from '../types.js';

const REL = 'nofollow noopener noreferrer';

function isExternal(url: string, options: ResolvedMfmOptions): boolean {
	const origin = getOrigin(options.instanceUrl);
	return origin == null || getOrigin(url) !== origin;
}

function baseUrl(options: ResolvedMfmOptions): string {
	return options.instanceUrl ?? '';
}

function isMe(
	username: string,
	host: string | null,
	isSourceHost: boolean,
	options: ResolvedMfmOptions,
): boolean {
	const { me } = options;
	if (!me || me.username.toLowerCase() !== username.toLowerCase()) return false;
	const meHost = resolveHost(me.host ?? null, { ...options, author: null });
	if (meHost.isSourceHost || isSourceHost) {
		return meHost.isSourceHost && isSourceHost;
	}
	return meHost.host?.toLowerCase() === host?.toLowerCase();
}

function avatarUrl(
	username: string,
	host: string | null,
	options: ResolvedMfmOptions,
): string {
	// /avatar/@user@hostは画像へリダイレクト
	const url = `${baseUrl(options)}/avatar/@${username}${host ? `@${host}` : ''}`;
	return (options.disableAnimatedImages || options.dataSaver.avatar) &&
		options.mediaProxy
		? staticImageUrl(options.mediaProxy, options.instanceUrl, url)
		: url;
}

export const linkRenderers = {
	url: (node, { ctx }) => {
		const { url } = node.props;
		if (!isSafeUrl(url)) return url;
		return renderComponent(ctx, 'url', {
			url,
			rel: REL,
			external: isExternal(url, ctx.options),
		});
	},
	link: (node, state) => {
		const { url, silent } = node.props;
		const children = state.renderNodes(node.children, { noNyaize: true });
		if (!isSafeUrl(url)) return h('span', children);
		return renderComponent(
			state.ctx,
			'link',
			{ url, rel: REL, external: isExternal(url, state.ctx.options), silent },
			children,
		);
	},
	mention: (node, { ctx }) => {
		const { username } = node.props;
		const { host, isSourceHost } = resolveHost(node.props.host, ctx.options);
		const acct =
			isSourceHost || host == null ? `@${username}` : `@${username}@${host}`;
		return renderComponent(ctx, 'mention', {
			username,
			host,
			isSourceHost,
			acct,
			href: baseUrl(ctx.options) + ctx.options.paths.user(acct),
			avatarUrl: avatarUrl(username, host, ctx.options),
			isMe: isMe(username, host, isSourceHost, ctx.options),
		});
	},
	hashtag: (node, { ctx }) => {
		const { hashtag } = node.props;
		return renderComponent(ctx, 'hashtag', {
			hashtag,
			href: baseUrl(ctx.options) + ctx.options.paths.hashtag(hashtag, ctx.options.isNote),
		});
	},
} satisfies Partial<NodeRendererMap>;

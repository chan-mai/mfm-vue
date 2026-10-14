import type { ResolvedMfmOptions } from '../types/index.js';

export interface ResolvedHost {
	// instanceUrl未指定かつ取得元サーバ所属の場合null
	host: string | null;
	isSourceHost: boolean;
}

// 省略時は投稿者のホストで補完
export function resolveHost(
	host: string | null,
	options: ResolvedMfmOptions,
): ResolvedHost {
	const actual = host ?? options.author?.host ?? null;
	if (actual == null) return { host: options.sourceHost, isSourceHost: true };
	const isSourceHost =
		options.sourceHost != null &&
		actual.toLowerCase() === options.sourceHost.toLowerCase();
	return { host: actual, isSourceHost };
}

import type { ResolvedMfmOptions } from './types/index.js';

// 取得元サーバ内なら/始まりであるべき
export function internalPath(
	href: string,
	instanceUrl: string | null,
): string | null {
	if (href.startsWith('/') && !href.startsWith('//')) return href;
	if (!instanceUrl) return null;
	try {
		const u = new URL(href);
		return u.origin === new URL(instanceUrl).origin
			? u.pathname + u.search + u.hash
			: null;
	} catch {
		return null;
	}
}

// 修飾キー付き, 中クリック等はブラウザ既定動作
export function handleLinkClick(
	event: MouseEvent,
	href: string,
	options: ResolvedMfmOptions,
): void {
	const { navigate } = options;
	if (
		!navigate ||
		event.defaultPrevented ||
		event.button !== 0 ||
		event.metaKey ||
		event.ctrlKey ||
		event.shiftKey ||
		event.altKey
	) {
		return;
	}
	const path = internalPath(href, options.instanceUrl);
	if (path == null) return;
	event.preventDefault();
	navigate(path, event);
}

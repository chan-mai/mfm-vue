// MisskeyメディプロURL規則

function query(params: Record<string, string>): string {
	return Object.entries(params)
		.map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
		.join('&');
}

export function proxiedImageUrl(
	mediaProxy: string,
	url: string,
	type?: 'emoji' | 'avatar',
	noFallback = false,
): string {
	return `${mediaProxy}/image.webp?${query({
		url,
		...(noFallback ? {} : { fallback: '1' }),
		...(type ? { [type]: '1' } : {}),
	})}`;
}

// プロキシ, /emoji/のURLはstatic指定のみ追加
export function staticImageUrl(
	mediaProxy: string,
	instanceUrl: string | null,
	url: string,
): string {
	let u: URL;
	try {
		u = new URL(url, instanceUrl ?? undefined);
	} catch {
		return url;
	}
	if (
		(instanceUrl && u.href.startsWith(`${instanceUrl}/emoji/`)) ||
		u.href.startsWith(`${mediaProxy}/`)
	) {
		u.searchParams.set('static', '1');
		return u.href;
	}
	return `${mediaProxy}/static.webp?${query({ url: u.href, static: '1' })}`;
}

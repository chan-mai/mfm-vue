export function safeParseFloat(value: unknown): number | null {
	if (typeof value !== 'string' || value === '') return null;
	const num = Number.parseFloat(value);
	return Number.isFinite(num) ? num : null;
}

// 例: 1s, 0.5s, -1s
export function validTime(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	return /^-?[0-9.]+s$/.test(value) ? value : null;
}

// #を除いた16進表記
export function validColor(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	return /^[0-9a-f]{3,6}$/i.test(value) ? value : null;
}

export function isSafeUrl(url: string): boolean {
	return /^https?:\/\//i.test(url);
}

export function getOrigin(url: string | null | undefined): string | null {
	if (!url) return null;
	try {
		return new URL(url).origin;
	} catch {
		return null;
	}
}

export function getHost(url: string | null | undefined): string | null {
	if (!url) return null;
	try {
		return new URL(url).host;
	} catch {
		return null;
	}
}

export function safeDecodeURIComponent(str: string): string {
	try {
		return decodeURIComponent(str);
	} catch {
		return str;
	}
}

// 本家nyanize等価
export function nyaize(text: string): string {
	return text
		.replaceAll('な', 'にゃ')
		.replaceAll('ナ', 'ニャ')
		.replaceAll('ﾅ', 'ﾆｬ')
		.replace(/(?<=n)a/gi, (x) => (x === 'A' ? 'YA' : 'ya'))
		.replace(/(?<=morn)ing/gi, (x) => (x === 'ING' ? 'YAN' : 'yan'))
		.replace(/(?<=every)one/gi, (x) => (x === 'ONE' ? 'NYAN' : 'nyan'))
		.replace(/[나-낳]/g, (c) =>
			String.fromCharCode(
				c.charCodeAt(0) + '냐'.charCodeAt(0) - '나'.charCodeAt(0),
			),
		)
		.replace(/(다$)|(다(?=\.))|(다(?= ))|(다(?=!))|(다(?=\?))/gm, '다냥')
		.replace(/(야(?=\?))|(야$)|(야(?= ))/gm, '냥');
}

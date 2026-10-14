import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import type { Ref } from 'vue';
import type {
	MfmUrlPreview,
	MfmUrlPreviewFetcher,
	MfmUserPreview,
	MfmUserPreviewFetcher,
} from './types/index.js';

const DELAY = 300;

function cached<V>(cache: Map<string, Promise<V | null>>, key: string, load: () => Promise<V | null>) {
	let promise = cache.get(key);
	if (!promise) {
		promise = load().catch(() => null);
		cache.set(key, promise);
	}
	return promise;
}

const urlCache = new WeakMap<MfmUrlPreviewFetcher, Map<string, Promise<MfmUrlPreview | null>>>();
const userCache = new WeakMap<MfmUserPreviewFetcher, Map<string, Promise<MfmUserPreview | null>>>();

function cacheFor<F extends object, V>(store: WeakMap<F, Map<string, Promise<V | null>>>, fetcher: F) {
	let map = store.get(fetcher);
	if (!map) {
		map = new Map();
		store.set(fetcher, map);
	}
	return map;
}

export function loadUrlPreview(fetcher: MfmUrlPreviewFetcher, url: string) {
	return cached(cacheFor(urlCache, fetcher), url, () => fetcher(url));
}

export function loadUserPreview(
	fetcher: MfmUserPreviewFetcher,
	user: { username: string; host: string | null },
) {
	const key = `${user.username}@${user.host ?? ''}`.toLowerCase();
	return cached(cacheFor(userCache, fetcher), key, () => fetcher(user));
}

// Misskeyの/url(summaly)互換APIから取得
export function createUrlPreviewFetcher(
	endpoint: string,
	// eslint-disable-next-line id-denylist
	options: { lang?: string; fetch?: typeof fetch } = {},
): MfmUrlPreviewFetcher {
	const doFetch = options.fetch ?? fetch;
	return async (url) => {
		const target = new URL(url);
		target.hash = '';
		const sep = endpoint.includes('?') ? '&' : '?';
		const query = `url=${encodeURIComponent(target.href)}${
			options.lang ? `&lang=${encodeURIComponent(options.lang)}` : ''
		}`;
		const res = await doFetch(`${endpoint}${sep}${query}`);
		if (!res.ok) return null;
		const json = (await res.json()) as Partial<MfmUrlPreview> | null;
		if (!json || json.url == null) return null;
		return {
			url: json.url,
			title: json.title ?? null,
			description: json.description ?? null,
			thumbnail: json.thumbnail ?? null,
			icon: json.icon ?? null,
			sitename: json.sitename ?? null,
			sensitive: json.sensitive ?? false,
		};
	};
}

interface UsersShowResponse {
	username: string;
	host: string | null;
	name: string | null;
	avatarUrl: string | null;
	bannerUrl: string | null;
	description: string | null;
	notesCount: number;
	followingCount: number;
	followersCount: number;
	followingVisibility?: string;
	followersVisibility?: string;
	isCat?: boolean;
	emojis?: Record<string, string>;
}

// 公開範囲がpublicの数のみ返却
export function createUserPreviewFetcher(
	endpoint: string,
	// eslint-disable-next-line id-denylist -- 公開APIのオプション名
	options: { fetch?: typeof fetch } = {},
): MfmUserPreviewFetcher {
	const doFetch = options.fetch ?? fetch;
	return async ({ username, host }) => {
		const res = await doFetch(endpoint, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ username, host }),
		});
		if (!res.ok) return null;
		const u = (await res.json()) as UsersShowResponse;
		return {
			username: u.username,
			host: u.host,
			name: u.name,
			avatarUrl: u.avatarUrl,
			bannerUrl: u.bannerUrl,
			description: u.description,
			notesCount: u.notesCount,
			followingCount:
				(u.followingVisibility ?? 'public') === 'public' ? u.followingCount : null,
			followersCount:
				(u.followersVisibility ?? 'public') === 'public' ? u.followersCount : null,
			isCat: u.isCat,
			emojis: u.emojis,
		};
	};
}

export interface HoverPopup<T> {
	showing: Ref<boolean>;
	loading: Ref<boolean>;
	data: Ref<T | null>;
	// interactive時はポップアップへ付与
	popupListeners: { onMouseover: () => void; onMouseleave: () => void };
}

// タップ直後のmouseoverは無視
export function useHoverPopup<T>(
	el: Ref<HTMLElement | null>,
	load: () => Promise<T | null> | null,
	options: { interactive?: boolean } = {},
): HoverPopup<T> {
	const showing = ref(false);
	const loading = ref(false);
	const data = shallowRef<T | null>(null);
	let showTimer: ReturnType<typeof setTimeout> | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | null = null;
	let touching = false;
	let seq = 0;

	function clearTimers() {
		if (showTimer) clearTimeout(showTimer);
		if (hideTimer) clearTimeout(hideTimer);
		showTimer = hideTimer = null;
	}

	async function show() {
		showTimer = null;
		const promise = load();
		if (!promise) return;
		const current = ++seq;
		showing.value = true;
		loading.value = true;
		const result = await promise;
		if (current !== seq) return;
		data.value = result;
		loading.value = false;
	}

	function hide() {
		clearTimers();
		seq++;
		showing.value = false;
	}

	function scheduleHide() {
		if (!options.interactive) {
			hide();
			return;
		}
		if (showTimer) clearTimeout(showTimer);
		showTimer = null;
		hideTimer ??= setTimeout(hide, DELAY);
	}

	function onMouseover() {
		if (touching) return;
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
		if (showing.value || showTimer) return;
		showTimer = setTimeout(show, DELAY);
	}

	function onTouchstart() {
		touching = true;
		clearTimers();
	}

	function onTouchend() {
		setTimeout(() => {
			touching = false;
		}, DELAY);
	}

	onMounted(() => {
		const node = el.value;
		if (!node) return;
		node.addEventListener('mouseover', onMouseover, { passive: true });
		node.addEventListener('mouseleave', scheduleHide, { passive: true });
		node.addEventListener('touchstart', onTouchstart, { passive: true });
		node.addEventListener('touchend', onTouchend, { passive: true });
	});

	onBeforeUnmount(() => {
		clearTimers();
		const node = el.value;
		if (!node) return;
		node.removeEventListener('mouseover', onMouseover);
		node.removeEventListener('mouseleave', scheduleHide);
		node.removeEventListener('touchstart', onTouchstart);
		node.removeEventListener('touchend', onTouchend);
	});

	return {
		showing,
		loading,
		data,
		popupListeners: {
			onMouseover: () => {
				if (hideTimer) clearTimeout(hideTimer);
				hideTimer = null;
			},
			onMouseleave: scheduleHide,
		},
	};
}

// アンカー直下, 画面内に収まる位置
export function popupPosition(
	anchor: HTMLElement | null,
	maxWidth: number,
	align: 'start' | 'center' = 'start',
) {
	if (!anchor) return { top: 0, left: 0, width: maxWidth };
	const rect = anchor.getBoundingClientRect();
	const width = Math.min(maxWidth, window.innerWidth * 0.9 - 12);
	const maxLeft = window.scrollX + window.innerWidth - width - 8;
	const start =
		align === 'center' ? rect.left + rect.width / 2 - width / 2 : rect.left;
	return {
		top: rect.bottom + window.scrollY + 4,
		left: Math.max(window.scrollX + 8, Math.min(start + window.scrollX, maxLeft)),
		width,
	};
}

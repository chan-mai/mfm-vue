import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { ComputedRef } from 'vue';

const INTERVAL = 10_000;
const now = ref(Date.now());
let subscribers = 0;
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
	if (document.visibilityState !== 'hidden') now.value = Date.now();
}

function subscribe() {
	subscribers++;
	if (timer) return;
	now.value = Date.now();
	timer = setInterval(tick, INTERVAL);
	document.addEventListener('visibilitychange', tick);
}

function unsubscribe() {
	subscribers--;
	if (subscribers > 0 || !timer) return;
	clearInterval(timer);
	timer = null;
	document.removeEventListener('visibilitychange', tick);
}

// マウント前null
export function useLowresNow(): ComputedRef<number | null> {
	const since = ref<number | null>(null);
	onMounted(() => {
		since.value = Date.now();
		subscribe();
	});
	onBeforeUnmount(() => {
		if (since.value != null) unsubscribe();
	});
	return computed(() =>
		since.value == null ? null : Math.max(now.value, since.value),
	);
}

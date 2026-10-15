import { ref, shallowRef } from 'vue';
import { proxyEndpoint, useDemoSettings } from './useDemoSettings';

const emojis = shallowRef<Record<string, string>>({});
const loading = ref(false);
const error = ref('');

async function load() {
	const settings = useDemoSettings();
	loading.value = true;
	error.value = '';
	try {
		const res = await fetch(proxyEndpoint('emojis'));
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json = (await res.json()) as { emojis: { name: string; url: string }[] };
		emojis.value = Object.fromEntries(json.emojis.map((emoji) => [emoji.name, emoji.url]));
		settings.emojiSource = 'api';
	} catch (cause) {
		error.value = String(cause);
	} finally {
		loading.value = false;
	}
}

export function useInstanceEmojis() {
	return { emojis, loading, error, load };
}

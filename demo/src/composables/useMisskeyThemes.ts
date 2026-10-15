import { ref, shallowRef } from 'vue';
import { useDemoSettings } from './useDemoSettings';

const baseThemes = shallowRef<string[]>([]);
const loaded = ref(false);
const loading = ref(false);
const error = ref('');

// NOTE: MisskeyのテーマはAGPLであるため同梱せずGitHubから取得
async function load() {
	const settings = useDemoSettings();
	const base = `https://raw.githubusercontent.com/misskey-dev/misskey/${settings.misskeyTag}/packages/frontend-shared/themes`;
	loading.value = true;
	error.value = '';
	try {
		const [light = '', dark = '', miLight = '', miDark = ''] = await Promise.all(
			['_light', '_dark', 'l-light', 'd-green-lime'].map(async (name) => {
				const res = await fetch(`${base}/${name}.json5`);
				if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
				return res.text();
			}),
		);
		baseThemes.value = [light, dark];
		settings.lightThemeCode = miLight;
		settings.darkThemeCode = miDark;
		loaded.value = true;
	} catch (cause) {
		error.value = String(cause);
	} finally {
		loading.value = false;
	}
}

export function useMisskeyThemes() {
	return { baseThemes, loaded, loading, error, load };
}

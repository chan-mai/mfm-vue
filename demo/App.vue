<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue';
import {
	Mfm,
	createInstanceEmojiResolver,
	createUrlPreviewFetcher,
	createUserPreviewFetcher,
	parseThemeCode,
	provideMfmConfig,
} from '../src/index.js';
import { SAMPLE } from './samples.js';
import type {
	MfmColorScheme,
	MfmCopyEvent,
	MfmTheme,
	MfmCustomEmojiResolver,
	MfmEmojiStyle,
} from '../src/index.js';

const SEARCH_ENGINES = {
	Google: 'https://www.google.com/search?q={query}',
	DuckDuckGo: 'https://duckduckgo.com/?q={query}',
	Bing: 'https://www.bing.com/search?q={query}',
};

const text = ref(SAMPLE);
const instanceUrl = ref('https://misskey.io');
const advanced = ref(true);
const animated = ref<'auto' | 'on' | 'off'>('auto');
const plain = ref(false);
const nowrap = ref(false);
const isCat = ref(false);
const locale = ref('ja-JP');
const highlight = ref(true);
const emojiStyle = ref<MfmEmojiStyle>('twemoji');
const me = ref('');
const urlPreview = ref(true);
const navigate = ref(true);
const searchEngine = ref<keyof typeof SEARCH_ENGINES>('Google');
const mediaProxy = ref('');
const disableAnimatedImages = ref(false);
const customHashtag = ref(false);
const userPreview = ref(true);
const colorScheme = ref<MfmColorScheme>('light');
const themeJson = ref('');
const dataSaverCode = ref(false);
const misskeyTag = ref('2026.10.0');
const baseThemes = shallowRef<string[]>([]);
const misskeyDefaults = shallowRef<{ light: string; dark: string } | null>(null);
const themeLoadError = ref('');

async function loadMisskeyThemes() {
	themeLoadError.value = '';
	const base = `https://raw.githubusercontent.com/misskey-dev/misskey/${misskeyTag.value}/packages/frontend-shared/themes`;
	try {
		const [light = '', dark = '', mi = '', miDark = ''] = await Promise.all(
			['_light', '_dark', 'l-light', 'd-green-lime'].map(async (name) => {
				const res = await fetch(`${base}/${name}.json5`);
				if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
				return res.text();
			}),
		);
		baseThemes.value = [light, dark];
		misskeyDefaults.value = { light: mi, dark: miDark };
	} catch (error) {
		themeLoadError.value = String(error);
	}
}

onMounted(loadMisskeyThemes);

const dataSaverThumbnail = ref(false);
const emojiMode = ref<'endpoint' | 'api' | 'none'>('endpoint');
const apiEmojis = shallowRef<Record<string, string>>({});
const loading = ref(false);
const loadError = ref('');
const log = ref<string[]>([]);

function addLog(line: string) {
	log.value = [`${new Date().toLocaleTimeString()} ${line}`, ...log.value].slice(0, 8);
}

function endpoint(path: 'emojis' | 'url' | 'users-show') {
	const instance = encodeURIComponent(instanceUrl.value);
	if (import.meta.env.DEV) return `/__proxy/${path}?instance=${instance}`;
	return {
		emojis: `${instanceUrl.value}/api/emojis`,
		url: `${instanceUrl.value}/url`,
		'users-show': `${instanceUrl.value}/api/users/show`,
	}[path];
}

const parsedTheme = computed<{ theme: MfmTheme | null; error: string }>(() => {
	if (!themeJson.value.trim()) return { theme: null, error: '' };
	try {
		return { theme: parseThemeCode(themeJson.value), error: '' };
	} catch (error) {
		return { theme: null, error: String(error) };
	}
});
const customTheme = computed(() => parsedTheme.value.theme);

async function loadEmojis() {
	loading.value = true;
	loadError.value = '';
	try {
		const res = await fetch(endpoint('emojis'));
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json = (await res.json()) as { emojis: { name: string; url: string }[] };
		apiEmojis.value = Object.fromEntries(json.emojis.map((emoji) => [emoji.name, emoji.url]));
		emojiMode.value = 'api';
	} catch (error) {
		loadError.value = String(error);
	} finally {
		loading.value = false;
	}
}

const customEmojis = computed<Record<string, string> | MfmCustomEmojiResolver | null>(() => {
	if (emojiMode.value === 'api') return apiEmojis.value;
	if (emojiMode.value === 'endpoint') return createInstanceEmojiResolver(instanceUrl.value);
	return null;
});

const previewFetcher = computed(() =>
	createUrlPreviewFetcher(endpoint('url'), { lang: locale.value }),
);
const userFetcher = computed(() => createUserPreviewFetcher(endpoint('users-show')));

provideMfmConfig(() => ({
	instanceUrl: instanceUrl.value,
	customEmojis: customEmojis.value,
	advanced: advanced.value,
	animated: animated.value === 'auto' ? 'auto' : animated.value === 'on',
	locale: locale.value,
	highlight: highlight.value,
	emojiStyle: emojiStyle.value,
	me: me.value ? { username: me.value } : null,
	urlPreview: urlPreview.value ? previewFetcher.value : null,
	userPreview: userPreview.value ? userFetcher.value : null,
	colorScheme: colorScheme.value,
	baseThemes: baseThemes.value,
	lightTheme: misskeyDefaults.value?.light ?? null,
	darkTheme: misskeyDefaults.value?.dark ?? null,
	...(customTheme.value
		? customTheme.value.base === 'dark' || customTheme.value.kind === 'dark'
			? { darkTheme: customTheme.value }
			: { lightTheme: customTheme.value }
		: {}),
	dataSaver: { code: dataSaverCode.value, urlPreviewThumbnail: dataSaverThumbnail.value },
	// 遷移なし, 記録のみ
	navigate: navigate.value ? (path: string) => addLog(`navigate: ${path}`) : null,
	searchEngine: SEARCH_ENGINES[searchEngine.value],
	mediaProxy: mediaProxy.value || null,
	disableAnimatedImages: disableAnimatedImages.value,
	onCopy: (event: MfmCopyEvent) => addLog(`copy: ${event.success ? 'ok' : 'failed'} (${event.text.length} chars)`),
}));
</script>

<template>
<main class="demo">
	<h1>mfm-vue demo</h1>
	<section class="controls">
		<label>instanceUrl <input v-model="instanceUrl"/></label>
		<label>
			locale
			<select v-model="locale">
				<option value="ja-JP">ja-JP</option>
				<option value="en-US">en-US</option>
				<option value="ko-KR">ko-KR</option>
				<option value="fr-FR">fr-FR</option>
			</select>
		</label>
		<label><input v-model="advanced" type="checkbox"/> advanced</label>
		<label>
			animated
			<select v-model="animated">
				<option value="auto">auto</option>
				<option value="on">true</option>
				<option value="off">false</option>
			</select>
		</label>
		<label><input v-model="plain" type="checkbox"/> plain</label>
		<label><input v-model="nowrap" type="checkbox"/> nowrap</label>
		<label><input v-model="isCat" type="checkbox"/> nyaize (isCat)</label>
		<label><input v-model="highlight" type="checkbox"/> highlight</label>
		<label><input v-model="urlPreview" type="checkbox"/> urlPreview</label>
		<label><input v-model="userPreview" type="checkbox"/> userPreview</label>
		<label><input v-model="navigate" type="checkbox"/> navigate</label>
		<label><input v-model="customHashtag" type="checkbox"/> custom hashtag (slot)</label>
	</section>
	<section class="controls">
		<label>
			emojiStyle
			<select v-model="emojiStyle">
				<option value="twemoji">twemoji</option>
				<option value="fluentEmoji">fluentEmoji</option>
				<option value="native">native</option>
			</select>
		</label>
		<label>
			custom emoji
			<select v-model="emojiMode">
				<option value="endpoint">/emoji endpoint</option>
				<option value="api">/api/emojis</option>
				<option value="none">none</option>
			</select>
		</label>
		<button type="button" :disabled="loading" @click="loadEmojis">
			{{ loading ? "Loading..." : "Load /api/emojis" }}
		</button>
		<span v-if="loadError" class="error">{{ loadError }}</span>
		<label>me <input v-model="me" placeholder="username" size="10"/></label>
		<label>
			searchEngine
			<select v-model="searchEngine">
				<option v-for="(_, name) in SEARCH_ENGINES" :key="name" :value="name">{{ name }}</option>
			</select>
		</label>
		<label>
			mediaProxy
			<input v-model="mediaProxy" placeholder="https://proxy.misskeyusercontent.jp" size="28"/>
		</label>
		<label><input v-model="disableAnimatedImages" type="checkbox"/> disableAnimatedImages</label>
	</section>
	<section class="controls">
		<label>
			colorScheme
			<select v-model="colorScheme">
				<option value="light">light</option>
				<option value="dark">dark</option>
				<option value="auto">auto</option>
			</select>
		</label>
		<label><input v-model="dataSaverCode" type="checkbox"/> dataSaver.code</label>
		<label><input v-model="dataSaverThumbnail" type="checkbox"/> dataSaver.urlPreviewThumbnail</label>
		<label>Misskey tag <input v-model="misskeyTag" size="10"/></label>
		<button type="button" @click="loadMisskeyThemes">Load Misskey themes</button>
		<span v-if="themeLoadError" class="error">{{ themeLoadError }}</span>
		<span v-else-if="baseThemes.length">base: _light, _dark / default: Mi Light, Mi Green+Lime Dark</span>
		<label class="theme">
			theme (Misskey theme JSON)
			<textarea
				v-model="themeJson"
				rows="3"
				placeholder="{ id: 'x', name: 'x', base: 'dark', props: { accent: '#e36749' } }"
			></textarea>
		</label>
		<span v-if="parsedTheme.error" class="error">{{ parsedTheme.error }}</span>
		<span v-else-if="customTheme">{{ customTheme.name }} ({{ customTheme.base }})</span>
	</section>
	<div class="panes">
		<textarea v-model="text" spellcheck="false"></textarea>
		<div class="preview" :class="`preview-${colorScheme}`" data-testid="preview">
			<Mfm
				:text="text"
				:plain="plain"
				:nowrap="nowrap"
				nyaize="respect"
				:author="{ host: null, isCat }"
				@clickEv="(ev) => addLog(`clickEv: ${ev}`)"
			>
				<template v-if="customHashtag" #hashtag="{ hashtag, href }">
					<a class="demo-hashtag" :href="href" target="_blank" rel="noopener">#{{ hashtag }}</a>
				</template>
			</Mfm>
		</div>
	</div>
	<ul class="log">
		<li v-for="line in log" :key="line">{{ line }}</li>
	</ul>
</main>
</template>

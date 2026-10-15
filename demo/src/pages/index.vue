<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { createInstanceEmojiResolver, createUrlPreviewFetcher, createUserPreviewFetcher, provideMfmConfig } from 'mfm-vue';
import EditorPane from '../components/playground/EditorPane.vue';
import EventLog from '../components/playground/EventLog.vue';
import PreviewPane from '../components/playground/PreviewPane.vue';
import SettingsPanel from '../components/settings/SettingsPanel.vue';
import { proxyEndpoint, SEARCH_ENGINES, useDemoSettings } from '../composables/useDemoSettings';
import { useEventLog } from '../composables/useEventLog';
import { useInstanceEmojis } from '../composables/useInstanceEmojis';
import { revealIn } from '../composables/useMotion';
import { useMisskeyThemes } from '../composables/useMisskeyThemes';
import type { MfmCopyEvent } from 'mfm-vue';

const settings = useDemoSettings();
const themes = useMisskeyThemes();
const emojis = useInstanceEmojis();
const log = useEventLog();

const customEmojis = computed(() => {
	if (settings.emojiSource === 'api') return emojis.emojis.value;
	if (settings.emojiSource === 'endpoint') return createInstanceEmojiResolver(settings.instanceUrl);
	return null;
});
const urlFetcher = computed(() => createUrlPreviewFetcher(proxyEndpoint('url'), { lang: settings.locale }));
const userFetcher = computed(() => createUserPreviewFetcher(proxyEndpoint('users-show')));
const themeKey = computed(() => [settings.lightThemeCode, settings.darkThemeCode, themes.baseThemes.value]);

provideMfmConfig(() => {
	return {
		instanceUrl: settings.instanceUrl,
		customEmojis: customEmojis.value,
		advanced: settings.advanced,
		animated: settings.animated === 'auto' ? 'auto' : settings.animated === 'on',
		locale: settings.locale,
		highlight: settings.highlight,
		emojiStyle: settings.emojiStyle,
		me: settings.me ? { username: settings.me } : null,
		urlPreview: settings.urlPreview ? urlFetcher.value : null,
		userPreview: settings.userPreview ? userFetcher.value : null,
		colorScheme: settings.colorScheme,
		baseThemes: themes.baseThemes.value,
		lightTheme: settings.lightThemeCode || null,
		darkTheme: settings.darkThemeCode || null,
		dataSaver: { code: settings.dataSaverCode, urlPreviewThumbnail: settings.dataSaverThumbnail },
		navigate: settings.navigate ? (path: string) => log.add('navigate', path) : null,
		searchEngine: SEARCH_ENGINES[settings.searchEngine],
		mediaProxy: settings.mediaProxy || null,
		disableAnimatedImages: settings.disableAnimatedImages,
		onCopy: (event: MfmCopyEvent) => log.add('copy', `${event.success ? 'ok' : 'failed'} (${event.text.length} chars)`),
	};
});

onMounted(() => {
	revealIn('[data-reveal]');
	void themes.load();
});
</script>

<template>
<main class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_320px]">
	<EditorPane/>
	<div class="flex min-w-0 flex-col gap-4">
		<PreviewPane :themeKey="themeKey"/>
		<EventLog/>
	</div>
	<SettingsPanel/>
</main>
</template>

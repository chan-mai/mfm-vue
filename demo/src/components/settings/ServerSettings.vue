<script setup lang="ts">
import { useDemoSettings } from '../../composables/useDemoSettings';
import { useInstanceEmojis } from '../../composables/useInstanceEmojis';
import UiButton from '../ui/UiButton.vue';
import UiSection from '../ui/UiSection.vue';
import UiSelect from '../ui/UiSelect.vue';
import UiSwitch from '../ui/UiSwitch.vue';
import UiTextField from '../ui/UiTextField.vue';

const settings = useDemoSettings();
const emojis = useInstanceEmojis();

const EMOJI_STYLES = [
	{ value: 'twemoji', label: 'twemoji' },
	{ value: 'fluentEmoji', label: 'fluentEmoji' },
	{ value: 'native', label: 'native' },
] as const;
const EMOJI_SOURCES = [
	{ value: 'endpoint', label: '/emoji/<name>' },
	{ value: 'api', label: '/api/emojis' },
	{ value: 'none', label: 'なし' },
] as const;
</script>

<template>
<UiSection title="サーバ・絵文字" defaultOpen>
	<UiTextField v-model="settings.instanceUrl" label="instanceUrl" placeholder="https://misskey.io"/>
	<UiSelect v-model="settings.emojiStyle" label="emojiStyle" :options="EMOJI_STYLES"/>
	<UiSelect v-model="settings.emojiSource" label="customEmojis" :options="EMOJI_SOURCES"/>
	<div class="flex items-center justify-end gap-2 py-1">
		<span v-if="emojis.error.value" class="truncate text-xs text-red-600">{{ emojis.error.value }}</span>
		<UiButton :loading="emojis.loading.value" @click="emojis.load">/api/emojisを取得</UiButton>
	</div>
	<UiTextField v-model="settings.me" label="me" placeholder="username"/>
	<UiTextField v-model="settings.mediaProxy" label="mediaProxy" placeholder="https://proxy.misskeyusercontent.jp"/>
	<UiSwitch v-model="settings.disableAnimatedImages" label="disableAnimatedImages"/>
</UiSection>
</template>

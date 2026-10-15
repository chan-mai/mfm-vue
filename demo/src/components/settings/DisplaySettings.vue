<script setup lang="ts">
import { FONT_SIZES, useDemoSettings } from '../../composables/useDemoSettings';
import UiSection from '../ui/UiSection.vue';
import UiSelect from '../ui/UiSelect.vue';
import UiSwitch from '../ui/UiSwitch.vue';

const settings = useDemoSettings();

const LOCALES = ['ja-JP', 'en-US', 'ko-KR', 'zh-CN', 'fr-FR', 'de-DE'].map((value) => ({ value, label: value }));
const SCHEMES = [
	{ value: 'light', label: 'light' },
	{ value: 'dark', label: 'dark' },
	{ value: 'auto', label: 'auto' },
] as const;
const ANIMATED = [
	{ value: 'auto', label: 'auto' },
	{ value: 'on', label: 'true' },
	{ value: 'off', label: 'false' },
] as const;
const SIZES = FONT_SIZES.map((value) => ({ value, label: `${value}px` }));
</script>

<template>
<UiSection title="表示" defaultOpen>
	<UiSelect v-model="settings.colorScheme" label="colorScheme" :options="SCHEMES"/>
	<UiSelect v-model="settings.locale" label="locale" :options="LOCALES"/>
	<UiSelect v-model="settings.fontSize" label="文字サイズ" :options="SIZES"/>
	<UiSelect v-model="settings.animated" label="animated" :options="ANIMATED"/>
	<UiSwitch v-model="settings.advanced" label="advanced"/>
	<UiSwitch v-model="settings.plain" label="plain"/>
	<UiSwitch v-model="settings.nowrap" label="nowrap"/>
	<UiSwitch v-model="settings.isCat" label="author.isCat" description="nyaize: respect"/>
</UiSection>
</template>

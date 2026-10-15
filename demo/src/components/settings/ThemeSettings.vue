<script setup lang="ts">
import { useDemoSettings } from '../../composables/useDemoSettings';
import { useMisskeyThemes } from '../../composables/useMisskeyThemes';
import UiButton from '../ui/UiButton.vue';
import UiSection from '../ui/UiSection.vue';
import UiTextField from '../ui/UiTextField.vue';
import ThemeCodeField from './ThemeCodeField.vue';

const settings = useDemoSettings();
const themes = useMisskeyThemes();
</script>

<template>
<UiSection title="テーマ">
	<UiTextField v-model="settings.misskeyTag" label="Misskeyのタグ"/>
	<div class="flex items-center justify-between gap-2 py-1">
		<span class="truncate text-xs" :class="themes.error.value ? 'text-red-600' : 'opacity-60'">
			{{ themes.error.value || (themes.loaded.value ? '_light, _dark, Mi Light, Mi Green+Lime Dark' : '未取得') }}
		</span>
		<UiButton :loading="themes.loading.value" @click="themes.load">取得</UiButton>
	</div>
	<ThemeCodeField v-model="settings.lightThemeCode" label="lightTheme" placeholder="{ id: 'x', name: 'x', base: 'light', props: { accent: '#86b300' } }"/>
	<ThemeCodeField v-model="settings.darkThemeCode" label="darkTheme" placeholder="{ id: 'x', name: 'x', base: 'dark', props: { accent: '#e36749' } }"/>
</UiSection>
</template>

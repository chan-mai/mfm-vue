<script setup lang="ts">
import { SEARCH_ENGINES, useDemoSettings } from '../../composables/useDemoSettings';
import UiSection from '../ui/UiSection.vue';
import UiSelect from '../ui/UiSelect.vue';
import UiSwitch from '../ui/UiSwitch.vue';

const settings = useDemoSettings();

const ENGINES = Object.keys(SEARCH_ENGINES).map((value) => ({ value: value as keyof typeof SEARCH_ENGINES, label: value }));
</script>

<template>
<UiSection title="機能">
	<UiSwitch v-model="settings.highlight" label="highlight" description="shikiによる色分け"/>
	<UiSwitch v-model="settings.urlPreview" label="urlPreview" description="URLとリンクのホバー"/>
	<UiSwitch v-model="settings.userPreview" label="userPreview" description="メンションのホバー"/>
	<UiSwitch v-model="settings.navigate" label="navigate" description="サイト内遷移を記録のみ"/>
	<UiSwitch v-model="settings.customHashtag" label="#hashtag slot" description="スロットによる差し替え"/>
	<UiSelect v-model="settings.searchEngine" label="searchEngine" :options="ENGINES"/>
	<UiSwitch v-model="settings.dataSaverCode" label="dataSaver.code"/>
	<UiSwitch v-model="settings.dataSaverThumbnail" label="dataSaver.urlPreviewThumbnail"/>
</UiSection>
</template>

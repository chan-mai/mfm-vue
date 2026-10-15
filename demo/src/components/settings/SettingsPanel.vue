<script setup lang="ts">
import DisplaySettings from './DisplaySettings.vue';
import FeatureSettings from './FeatureSettings.vue';
import ServerSettings from './ServerSettings.vue';
import ThemeSettings from './ThemeSettings.vue';
</script>

<template>
<aside data-reveal class="card h-fit overflow-hidden lg:sticky lg:top-6">
	<div class="px-4 lg:my-3 lg:max-h-[calc(100dvh-4.5rem)] lg:overflow-y-auto lg:[scrollbar-gutter:stable] lg:[scrollbar-width:thin]">
		<DisplaySettings/>
		<ServerSettings/>
		<FeatureSettings/>
		<ThemeSettings/>
	</div>
</aside>
</template>

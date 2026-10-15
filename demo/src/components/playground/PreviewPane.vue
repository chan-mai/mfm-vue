<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import { Mfm } from 'mfm-vue';
import { useDemoSettings } from '../../composables/useDemoSettings';
import { useEventLog } from '../../composables/useEventLog';

const props = defineProps<{ themeKey: unknown }>();

const settings = useDemoSettings();
const log = useEventLog();
const frame = useTemplateRef<HTMLElement>('frame');

// テーマのbgと配色をプレビュー枠へ反映
const surface = ref({ background: '', colorScheme: '' });

function syncSurface() {
	const root = frame.value?.querySelector('.mfm');
	if (!root) return;
	const style = getComputedStyle(root);
	surface.value = {
		background: style.getPropertyValue('--mfm-theme-bg').trim(),
		colorScheme: style.colorScheme,
	};
}

onMounted(syncSurface);
watch(
	() => [settings.colorScheme, settings.text === '', props.themeKey],
	() => nextTick(syncSurface),
);
</script>

<template>
<section data-reveal class="card flex min-h-[480px] flex-col overflow-hidden">
	<div class="flex items-center justify-between border-b border-black/5 px-4 py-2 dark:border-white/5">
		<h2 class="text-sm font-bold">プレビュー</h2>
		<span class="font-mono text-xs opacity-50">{{ settings.fontSize }}px</span>
	</div>
	<div
		ref="frame"
		class="flex-1 overflow-auto p-4"
		:style="{
			backgroundColor: surface.background || undefined,
			colorScheme: surface.colorScheme || undefined,
			fontSize: `${settings.fontSize}px`,
			lineHeight: 1.35,
			overflow: 'clip auto',
		}"
	>
		<Mfm
			:text="settings.text"
			:plain="settings.plain"
			:nowrap="settings.nowrap"
			nyaize="respect"
			:author="{ host: null, isCat: settings.isCat }"
			@clickEv="(ev) => log.add('clickEv', ev)"
		>
			<template v-if="settings.customHashtag" #hashtag="{ hashtag, href }">
				<a class="rounded bg-accent/15 px-1 text-accent-strong dark:text-accent" :href="href" target="_blank" rel="noopener">#{{ hashtag }}</a>
			</template>
		</Mfm>
	</div>
</section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { SAMPLES } from '../../data/samples';
import { useDemoSettings } from '../../composables/useDemoSettings';
import UiSelect from '../ui/UiSelect.vue';

const settings = useDemoSettings();
const sampleId = ref(SAMPLES[0]?.id ?? '');
const options = SAMPLES.map((sample) => ({ value: sample.id, label: sample.label }));

watch(sampleId, (id) => {
	const sample = SAMPLES.find((s) => s.id === id);
	if (sample) settings.text = sample.text;
});
</script>

<template>
<section data-reveal class="card flex min-h-[480px] flex-col overflow-hidden">
	<div class="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-2 dark:border-white/5">
		<h2 class="text-sm font-bold">MFM</h2>
		<UiSelect v-model="sampleId" label="サンプル" :options="options"/>
	</div>
	<textarea
		v-model="settings.text"
		class="min-h-[420px] flex-1 resize-none border-none bg-transparent p-4 font-mono text-[13px] leading-relaxed outline-none"
		spellcheck="false"
		aria-label="MFM"
	></textarea>
	<div class="border-t border-black/5 px-4 py-1.5 text-right font-mono text-xs opacity-50 dark:border-white/5">{{ settings.text.length }} chars</div>
</section>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import { themeCodeStatus } from '../../composables/useThemeCode';

defineProps<{ label: string; placeholder: string }>();

const model = defineModel<string>({ required: true });
const id = useId();
const status = computed(() => themeCodeStatus(model.value));
</script>

<template>
<div class="flex flex-col gap-1 py-1">
	<div class="flex items-baseline justify-between gap-2">
		<label :for="id" class="font-mono text-[13px]">{{ label }}</label>
		<span class="truncate text-xs" :class="status.error ? 'text-red-600' : 'opacity-60'">{{ status.label }}</span>
	</div>
	<textarea :id="id" v-model="model" class="field h-32 resize-y font-mono text-xs" :placeholder="placeholder" spellcheck="false"></textarea>
</div>
</template>

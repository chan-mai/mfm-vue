<script setup lang="ts">
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from '@headlessui/vue';

defineProps<{ label: string; description?: string }>();

const model = defineModel<boolean>({ required: true });
</script>

<template>
<SwitchGroup as="div" class="flex items-center justify-between gap-3 py-1">
	<span class="flex min-w-0 flex-col">
		<SwitchLabel class="cursor-pointer font-mono text-[13px]">{{ label }}</SwitchLabel>
		<SwitchDescription v-if="description" class="text-xs opacity-60">{{ description }}</SwitchDescription>
	</span>
	<Switch
		v-model="model"
		class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-none transition-colors duration-300"
		:class="model ? 'bg-accent' : 'bg-black/15 dark:bg-white/20'"
	>
		<span
			class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-out-expo)]"
			:class="model ? 'translate-x-4' : 'translate-x-0'"
			aria-hidden="true"
		></span>
	</Switch>
</SwitchGroup>
</template>

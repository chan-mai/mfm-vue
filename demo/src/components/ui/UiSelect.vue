<script setup lang="ts" generic="T extends string | number">
import { computed } from 'vue';
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue';

const props = defineProps<{
	label: string;
	options: readonly { value: T; label: string }[];
}>();

const model = defineModel<T>({ required: true });
const current = computed(() => props.options.find((option) => option.value === model.value));
</script>

<template>
<Listbox v-model="model" as="div" class="relative flex items-center justify-between gap-3 py-1">
	<ListboxLabel class="font-mono text-[13px]">{{ label }}</ListboxLabel>
	<ListboxButton v-slot="{ open }" class="field flex !w-auto min-w-32 items-center justify-between gap-2 text-left">
		<span class="truncate">{{ current?.label }}</span>
		<svg
			class="size-3.5 shrink-0 opacity-60 transition-transform duration-300"
			:class="{ 'rotate-180': open }"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path d="M6 9l6 6 6-6"/>
		</svg>
	</ListboxButton>
	<Transition
		enterActiveClass="transition duration-300 ease-[var(--ease-out-expo)]"
		enterFromClass="opacity-0 -translate-y-1 scale-95"
		leaveActiveClass="transition duration-150 ease-in"
		leaveToClass="opacity-0 scale-95"
	>
		<ListboxOptions class="card absolute top-full right-0 z-20 mt-1 max-h-64 min-w-40 origin-top-right overflow-auto p-1 text-[13px] shadow-lg">
			<ListboxOption v-for="option in options" :key="option.value" v-slot="{ active, selected }" :value="option.value" as="template">
				<li
					class="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-1.5"
					:class="[active ? 'bg-accent/15' : '', selected ? 'font-bold text-accent-strong dark:text-accent' : '']"
				>
					{{ option.label }}
					<svg v-if="selected" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
						<path d="M5 12l5 5L20 7"/>
					</svg>
				</li>
			</ListboxOption>
		</ListboxOptions>
	</Transition>
</Listbox>
</template>

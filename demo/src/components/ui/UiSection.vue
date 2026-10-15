<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { collapse, expand } from '../../composables/useMotion';

defineProps<{ title: string; defaultOpen?: boolean }>();
</script>

<template>
<Disclosure v-slot="{ open }" as="section" :defaultOpen="defaultOpen" class="border-b border-black/5 last:border-b-0 dark:border-white/5">
	<DisclosureButton class="flex w-full items-center justify-between border-none bg-transparent py-3 text-left text-sm font-bold">
		{{ title }}
		<svg
			class="size-4 opacity-50 transition-transform duration-300"
			:class="{ 'rotate-180': open }"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path d="M6 9l6 6 6-6"/>
		</svg>
	</DisclosureButton>
	<Transition :css="false" @enter="expand" @leave="collapse">
		<DisclosurePanel class="overflow-hidden">
			<div class="flex flex-col pb-3">
				<slot></slot>
			</div>
		</DisclosurePanel>
	</Transition>
</Disclosure>
</template>

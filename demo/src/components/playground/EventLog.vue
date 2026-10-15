<script setup lang="ts">
import { useEventLog } from '../../composables/useEventLog';

const { entries } = useEventLog();
</script>

<template>
<section data-reveal class="card px-4 py-3">
	<h2 class="mb-2 text-sm font-bold">イベント</h2>
	<p v-if="entries.length === 0" class="text-xs opacity-50">リンク, コピー, $[clickable]の操作がここに表示されます</p>
	<TransitionGroup
		tag="ul"
		class="flex flex-col gap-1 font-mono text-xs"
		enterActiveClass="transition duration-500 ease-[var(--ease-out-expo)]"
		enterFromClass="opacity-0 -translate-x-2"
	>
		<li v-for="entry in entries" :key="entry.id" class="flex gap-2">
			<span class="opacity-50">{{ entry.time }}</span>
			<span class="font-bold text-accent-strong dark:text-accent">{{ entry.kind }}</span>
			<span class="truncate">{{ entry.detail }}</span>
		</li>
	</TransitionGroup>
</section>
</template>

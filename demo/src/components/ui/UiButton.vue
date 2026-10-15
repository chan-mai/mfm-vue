<script setup lang="ts">
defineProps<{ loading?: boolean }>();
</script>

<template>
<button
	type="button"
	class="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border-none bg-accent px-3 py-1.5 text-[13px] font-bold text-white transition-[filter,transform] duration-200 hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-60"
	:disabled="loading"
>
	<svg v-if="loading" class="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">
		<path d="M12 3a9 9 0 1 0 9 9"/>
	</svg>
	<slot></slot>
</button>
</template>

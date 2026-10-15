<script setup lang="ts">
const SINCE = 2026;
const current = new Date().getFullYear();
const years = current > SINCE ? `${SINCE}-${current}` : String(SINCE);
</script>

<template>
<footer class="border-t border-black/5 pt-4 pb-2 text-center text-xs opacity-60 dark:border-white/10">
	© {{ years }}
	<a href="https://github.com/chan-mai/mfm-vue" target="_blank" rel="noopener" class="underline-offset-2 hover:text-accent hover:underline">mfm-vue</a>
	by
	<a href="https://mq1.dev/about" target="_blank" rel="noopener" class="underline-offset-2 hover:text-accent hover:underline">chan-mai</a>.
	Released under the
	<a href="https://github.com/chan-mai/mfm-vue/blob/develop/LICENSE" target="_blank" rel="noopener" class="underline-offset-2 hover:text-accent hover:underline">MIT License</a>.
</footer>
</template>

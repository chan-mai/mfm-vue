<script setup lang="ts">
import type { MfmInlineCodeProps } from '../../types/index.js';

defineProps<MfmInlineCodeProps>();
</script>

<template>
<code class="mfm-inline-code">{{ code }}</code>
</template>

<style scoped>
.mfm-inline-code {
	display: inline-block;
	padding: 0.1em;
	border-radius: 0.3em;
	font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
	overflow-wrap: anywhere;
	background: var(--mfm-theme-bg, rgba(128, 128, 128, 0.1));
}
</style>

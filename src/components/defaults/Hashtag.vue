<script setup lang="ts">
import { useMfmContext } from '../../context.js';
import { handleLinkClick } from '../../navigation.js';
import type { MfmHashtagProps } from '../../types/index.js';

defineProps<MfmHashtagProps>();
const ctx = useMfmContext();
</script>

<template>
<a
	class="mfm-hashtag"
	:href="href"
	@click="handleLinkClick($event, href, ctx)"
>#{{ hashtag }}</a>
</template>

<style scoped>
.mfm-hashtag {
	color: var(--mfm-theme-hashtag, #ff9156);
	text-decoration: none;
}
</style>

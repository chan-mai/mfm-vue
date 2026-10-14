<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { colorizeEmoji, getEmojiName } from '../../emoji-name.js';
import type { MfmUnicodeEmojiProps } from '../../types/index.js';

const props = defineProps<MfmUnicodeEmojiProps>();

const errored = ref(false);
const title = ref<string>();
watch(
	() => props.url,
	() => {
		errored.value = false;
	},
);

const colorized = computed(() => colorizeEmoji(props.emoji));

async function computeTitle() {
	title.value ??= await getEmojiName(props.emoji);
}
</script>

<template>
<img
	v-if="url && !errored"
	class="mfm-unicode-emoji"
	:src="url"
	:alt="emoji"
	:title="title"
	decoding="async"
	referrerpolicy="no-referrer"
	@pointerenter="computeTitle"
	@error="errored = true"
/>
<span
	v-else
	class="mfm-unicode-emoji-char"
	:title="title"
	@pointerenter="computeTitle"
>{{ colorized }}</span>
</template>

<style scoped>
.mfm-unicode-emoji {
	height: 1.25em;
	vertical-align: -0.25em;
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { MfmCustomEmojiProps } from '../../types/index.js';

const props = defineProps<MfmCustomEmojiProps>();

const errored = ref(false);
watch(
	() => props.url,
	() => {
		errored.value = false;
	},
);

const alt = computed(() => `:${props.name}:`);
</script>

<template>
<span v-if="url == null || errored">{{ alt }}</span>
<img
	v-else
	class="mfm-custom-emoji"
	:class="{ normal }"
	:src="url"
	:alt="alt"
	:title="alt"
	decoding="async"
	referrerpolicy="no-referrer"
	draggable="false"
	@error="errored = true"
/>
</template>

<style scoped>
.mfm-custom-emoji {
	height: 2em;
	vertical-align: middle;
	-webkit-user-drag: none;
	transition: transform 0.2s ease;
}

.mfm-custom-emoji:hover {
	transform: scale(1.2);
}

.normal {
	height: 1.25em;
	vertical-align: -0.25em;
}

.normal:hover {
	transform: none;
}
</style>

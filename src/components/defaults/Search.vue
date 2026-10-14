<script setup lang="ts">
import { computed } from 'vue';
import { useMfmContext } from '../../context.js';
import Icon from './Icon.vue';
import type { MfmSearchProps } from '../../types/index.js';

defineProps<MfmSearchProps>();
const ctx = useMfmContext();

const PLACEHOLDER = '__mfm_query__';

// クエリ文字列を含むURLをフォームに変換
const form = computed(() => {
	const template = ctx.value.searchEngine;
	try {
		const u = new URL(template.replace('{query}', PLACEHOLDER));
		const entries = [...u.searchParams.entries()];
		const name = entries.find(([, v]) => v === PLACEHOLDER)?.[0];
		if (!name) return null;
		return {
			action: u.origin + u.pathname,
			name,
			hidden: entries.filter(([k]) => k !== name),
		};
	} catch {
		return null;
	}
});

function onSubmit(event: Event) {
	if (form.value) return;
	event.preventDefault();
	const input = (event.target as HTMLFormElement).elements.namedItem('q');
	const query = input instanceof HTMLInputElement ? input.value : '';
	const url = ctx.value.searchEngine.replace('{query}', encodeURIComponent(query));
	window.open(url, '_blank', 'noopener');
}
</script>

<template>
<form
	class="mfm-search"
	:action="form?.action"
	method="get"
	target="_blank"
	rel="noopener noreferrer"
	@submit="onSubmit"
>
	<input
		v-for="[k, v] in form?.hidden ?? []"
		:key="k"
		type="hidden"
		:name="k"
		:value="v"
	/>
	<input
		class="input"
		type="search"
		:name="form?.name ?? 'q'"
		:value="query"
		:placeholder="query"
	/>
	<button class="button" type="submit">
		<Icon name="search"/> {{ ctx.messages.search }}
	</button>
</form>
</template>

<style scoped>
.mfm-search {
	display: flex;
	margin: 8px 0;
}

.input {
	flex-shrink: 1;
	width: 100%;
	height: 40px;
	padding: 10px;
	box-sizing: border-box;
	border: solid 1px var(--mfm-theme-divider, rgba(128, 128, 128, 0.25));
	border-radius: 4px 0 0 4px;
	font-size: 16px;
	-webkit-appearance: textfield;
}

.button {
	flex-shrink: 0;
	margin: 0;
	padding: 0 16px;
	border: solid 1px var(--mfm-theme-divider, rgba(128, 128, 128, 0.25));
	border-left: none;
	border-radius: 0 4px 4px 0;
}

.button:active {
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) inset;
}
</style>

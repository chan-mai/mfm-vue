<script setup lang="ts">
import { computed } from 'vue';
import { useLowresNow } from '../../clock.js';
import { useMfmContext } from '../../context.js';
import { formatRelativeTime } from '../../i18n/index.js';
import Icon from './Icon.vue';
import type { MfmUnixtimeProps } from '../../types/index.js';

const props = defineProps<MfmUnixtimeProps>();
const ctx = useMfmContext();

// NOTE: SSR/hydrate時 UTC前提
const now = useLowresNow();

const date = computed(() => new Date(props.time));
const invalid = computed(() => Number.isNaN(props.time));

const absolute = computed(() =>
	invalid.value
		? ctx.value.messages.invalidTime
		: now.value == null
			? null
			: new Intl.DateTimeFormat(ctx.value.locale, {
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric',
			}).format(date.value),
);

const label = computed(() => {
	if (invalid.value) return ctx.value.messages.invalidTime;
	if (now.value == null) {
		return `${date.value.toISOString().slice(0, 19).replace('T', ' ')} UTC`;
	}
	const ago = (now.value - props.time) / 1000;
	return `${absolute.value} (${formatRelativeTime(ago, ctx.value.messages, ctx.value.locale)})`;
});
</script>

<template>
<span class="mfm-unixtime">
	<Icon name="clock" class="clock"/>
	<time
		:datetime="invalid ? undefined : date.toISOString()"
		:title="absolute ?? undefined"
	>{{ label }}</time>
</span>
</template>

<style scoped>
.mfm-unixtime {
	display: inline-block;
	padding: 4px 10px 4px 6px;
	border: solid 1px var(--mfm-theme-divider, rgba(128, 128, 128, 0.25));
	border-radius: 999px;
	font-size: 90%;
}

.clock {
	margin-right: 0.25em;
}
</style>

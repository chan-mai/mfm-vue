<script setup lang="ts">
import { computed, ref } from 'vue';
import punycode from 'punycode.js';
import { useMfmContext } from '../../context.js';
import { handleLinkClick } from '../../navigation.js';
import { loadUrlPreview, useHoverPopup } from '../../preview.js';
import { safeDecodeURIComponent } from '../../utils.js';
import Icon from './Icon.vue';
import UrlPreviewPopup from './UrlPreviewPopup.vue';
import type { MfmUrlProps } from '../../types/index.js';
import type { MfmUrlPreview } from '../../types/index.js';

const props = defineProps<MfmUrlProps>();
const ctx = useMfmContext();
const el = ref<HTMLElement | null>(null);
const preview = useHoverPopup<MfmUrlPreview>(el, () => {
	const fetcher = ctx.value.urlPreview;
	return fetcher ? loadUrlPreview(fetcher, props.url) : null;
});

const parts = computed(() => {
	try {
		const u = new URL(props.url);
		return {
			schema: u.protocol,
			hostname: punycode.toUnicode(u.hostname),
			port: u.port,
			pathname: safeDecodeURIComponent(u.pathname),
			query: safeDecodeURIComponent(u.search),
			hash: safeDecodeURIComponent(u.hash),
		};
	} catch {
		return null;
	}
});
</script>

<template>
<a
	ref="el"
	class="mfm-url"
	:href="url"
	:rel="rel"
	:target="external ? '_blank' : undefined"
	@click="handleLinkClick($event, url, ctx)"
>
	<template v-if="parts">
		<template v-if="external">
			<span class="schema">{{ parts.schema }}//</span>
			<span class="hostname">{{ parts.hostname }}</span>
			<span v-if="parts.port">:{{ parts.port }}</span>
		</template>
		<span v-else-if="parts.pathname === '/'" class="hostname">{{
			parts.hostname
		}}</span>
		<span class="pathname">{{
			external ? parts.pathname : parts.pathname.slice(1)
		}}</span>
		<span class="query">{{ parts.query }}</span>
		<span class="hash">{{ parts.hash }}</span>
	</template>
	<template v-else>{{ url }}</template>
	<Icon v-if="external" name="external" class="external"/>
	<Teleport v-if="preview.showing.value" to="body">
		<UrlPreviewPopup
			:url="url"
			:anchor="el"
			:loading="preview.loading.value"
			:data="preview.data.value"
		/>
	</Teleport>
</a>
</template>

<style scoped>
.mfm-url {
	color: var(--mfm-theme-link, #44a4c1);
	text-decoration: none;
	word-break: break-all;
}

.schema,
.query {
	color: color-mix(in srgb, currentColor 50%, transparent);
}

.hostname {
	font-weight: bold;
}

.pathname {
	color: color-mix(in srgb, currentColor 80%, transparent);
}

.hash {
	font-style: italic;
}

.external {
	padding-left: 2px;
	font-size: 0.9em;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import { useMfmContext } from '../../context.js';
import { handleLinkClick } from '../../navigation.js';
import { loadUrlPreview, useHoverPopup } from '../../preview.js';
import Icon from './Icon.vue';
import UrlPreviewPopup from './UrlPreviewPopup.vue';
import type { MfmUrlPreview } from '../../types/index.js';
import type { MfmLinkProps } from '../../types/index.js';

const props = defineProps<MfmLinkProps>();
const ctx = useMfmContext();
const el = ref<HTMLElement | null>(null);
const preview = useHoverPopup<MfmUrlPreview>(el, () => {
	const fetcher = ctx.value.urlPreview;
	return fetcher ? loadUrlPreview(fetcher, props.url) : null;
});
</script>

<template>
<a
	ref="el"
	class="mfm-link"
	:href="url"
	:rel="rel"
	:target="external ? '_blank' : undefined"
	:title="url"
	@click="handleLinkClick($event, url, ctx)"
>
	<slot></slot>
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
.mfm-link {
	color: var(--mfm-theme-link, #44a4c1);
	text-decoration: none;
	word-break: break-all;
}

.external {
	padding-left: 2px;
	font-size: 0.9em;
}
</style>

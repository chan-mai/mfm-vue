<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useMfmContext } from '../../context.js';
import { popupPosition } from '../../preview.js';
import { themeAttrs } from '../../theme-attrs.js';
import type { MfmUrlPreview } from '../../types/index.js';

const props = defineProps<{
	url: string;
	anchor: HTMLElement | null;
	loading: boolean;
	data: MfmUrlPreview | null;
}>();
const ctx = useMfmContext();

const position = ref({ top: 0, left: 0, width: 500 });
onMounted(() => {
	position.value = popupPosition(props.anchor, 500);
});

const theme = computed(() => themeAttrs(ctx.value));
const showThumbnail = computed(
	() =>
		!!props.data?.thumbnail &&
		!props.data.sensitive &&
		!ctx.value.dataSaver.urlPreviewThumbnail,
);

const host = computed(() => {
	try {
		return new URL(props.url).host;
	} catch {
		return props.url;
	}
});

const description = computed(() => {
	const d = props.data?.description;
	if (!d) return null;
	return d.length > 85 ? `${d.slice(0, 85)}…` : d;
});
</script>

<template>
<div
	class="mfm-url-preview"
	:class="['mfm-base', theme.class]"
	:style="[
		theme.style,
		{
			top: `${position.top}px`,
			left: `${position.left}px`,
			width: `${position.width}px`,
		},
	]"
>
	<div class="card">
		<img
			v-if="showThumbnail"
			class="thumbnail"
			:src="data!.thumbnail!"
			alt=""
			decoding="async"
			referrerpolicy="no-referrer"
		/>
		<article class="body" :class="{ withThumbnail: showThumbnail }">
			<header class="header">
				<h1 v-if="loading" class="title">…</h1>
				<h1 v-else class="title">{{ data?.title ?? url }}</h1>
			</header>
			<p v-if="loading" class="text">…</p>
			<p v-else-if="!data" class="text">{{ ctx.messages.failedToPreviewUrl }}</p>
			<p v-else-if="description" class="text">{{ description }}</p>
			<footer class="footer">
				<img
					v-if="data?.icon"
					class="siteIcon"
					:src="data.icon"
					alt=""
					decoding="async"
					referrerpolicy="no-referrer"
				/>
				<p class="siteName">{{ data?.sitename ?? host }}</p>
			</footer>
		</article>
	</div>
</div>
</template>

<style scoped>
.mfm-url-preview {
	position: absolute;
	z-index: 1000;
	pointer-events: none;
	white-space: normal;
}

.card {
	position: relative;
	overflow: clip;
	border-radius: 8px;
	font-size: 14px;
	text-align: left;
	color: var(--mfm-theme-fg, CanvasText);
	background: var(--mfm-theme-popup, Canvas);
	box-shadow:
		0 0 0 1px var(--mfm-theme-divider, rgba(128, 128, 128, 0.25)),
		0 4px 32px var(--mfm-theme-shadow, rgba(0, 0, 0, 0.15));
}

.thumbnail {
	position: absolute;
	width: 100px;
	height: 100%;
	object-fit: cover;
	background: var(--mfm-theme-bg, rgba(128, 128, 128, 0.1));
}

.body {
	position: relative;
	box-sizing: border-box;
	padding: 16px;
}

.withThumbnail {
	left: 100px;
	width: calc(100% - 100px);
}

.header {
	margin-bottom: 8px;
}

.title {
	margin: 0;
	font-size: 1em;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.text {
	margin: 0;
	font-size: 0.8em;
}

.footer {
	margin-top: 8px;
	height: 16px;
}

.siteIcon {
	display: inline-block;
	width: 16px;
	height: 16px;
	margin-right: 4px;
	vertical-align: top;
}

.siteName {
	display: inline-block;
	margin: 0;
	font-size: 0.8em;
	line-height: 16px;
	vertical-align: top;
}
</style>

<style scoped src="../../styles/base.css"></style>

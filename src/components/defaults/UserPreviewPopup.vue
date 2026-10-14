<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, provide, ref } from 'vue';
import punycode from 'punycode.js';
import { mfmConfigKey } from '../../config.js';
import { useMfmContext } from '../../context.js';
import { handleLinkClick } from '../../navigation.js';
import { popupPosition } from '../../preview.js';
import { themeAttrs } from '../../theme-attrs.js';
import type { MfmOptions, MfmUserPreview } from '../../types/index.js';

// NOTE: 循環参照回避のため遅延
const Mfm = defineAsyncComponent(() => import('../Mfm.vue'));

const props = defineProps<{
	anchor: HTMLElement | null;
	href: string;
	loading: boolean;
	data: MfmUserPreview | null;
}>();
const ctx = useMfmContext();

const position = ref({ top: 0, left: 0, width: 300 });
onMounted(() => {
	position.value = popupPosition(props.anchor, 300, 'center');
});

const theme = computed(() => themeAttrs(ctx.value));

// 名前, 自己紹介の絵文字は対象ユーザ情報で解決
provide(mfmConfigKey, (): MfmOptions => ({
	...ctx.value.source,
	author: { host: props.data?.host ?? null, isCat: props.data?.isCat },
	emojiUrls: props.data?.emojis ?? null,
}));

const acct = computed(() => {
	const d = props.data;
	if (!d) return '';
	return d.host ? `@${d.username}@${punycode.toUnicode(d.host)}` : `@${d.username}`;
});

const numberFormat = computed(() => new Intl.NumberFormat(ctx.value.locale));
</script>

<template>
<div
	class="mfm-user-preview"
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
	<div v-if="loading" class="loading">…</div>
	<template v-else-if="data">
		<div class="banner">
			<img
				v-if="data.bannerUrl"
				:src="data.bannerUrl"
				alt=""
				decoding="async"
				referrerpolicy="no-referrer"
			/>
		</div>
		<div class="avatarBack"></div>
		<a :href="href" @click="handleLinkClick($event, href, ctx)">
			<img
				v-if="data.avatarUrl"
				class="avatar"
				:src="data.avatarUrl"
				alt=""
				decoding="async"
				referrerpolicy="no-referrer"
			/>
		</a>
		<div class="title">
			<a class="name" :href="href" @click="handleLinkClick($event, href, ctx)">
				<Mfm :text="data.name ?? data.username" plain/>
			</a>
			<div class="username">{{ acct }}</div>
		</div>
		<div class="description">
			<Mfm v-if="data.description" class="mfm" :text="data.description"/>
			<div v-else class="empty">{{ ctx.messages.noAccountDescription }}</div>
		</div>
		<div class="status">
			<div class="statusItem">
				<div class="statusItemLabel">{{ ctx.messages.notes }}</div>
				<div>{{ numberFormat.format(data.notesCount) }}</div>
			</div>
			<div v-if="data.followingCount != null" class="statusItem">
				<div class="statusItemLabel">{{ ctx.messages.following }}</div>
				<div>{{ numberFormat.format(data.followingCount) }}</div>
			</div>
			<div v-if="data.followersCount != null" class="statusItem">
				<div class="statusItemLabel">{{ ctx.messages.followers }}</div>
				<div>{{ numberFormat.format(data.followersCount) }}</div>
			</div>
		</div>
	</template>
</div>
</template>

<style scoped>
.mfm-user-preview {
	position: absolute;
	z-index: 1000;
	overflow: clip;
	border-radius: 12px;
	font-size: 14px;
	white-space: normal;
	text-align: left;
	color: var(--mfm-theme-fg, CanvasText);
	background: var(--mfm-theme-popup, Canvas);
	box-shadow: 0 4px 32px var(--mfm-theme-shadow, rgba(0, 0, 0, 0.15));
}

.loading {
	padding: 32px;
	text-align: center;
	opacity: 0.7;
}

.banner {
	height: 78px;
	background-color: rgba(0, 0, 0, 0.1);
}

.banner img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

/* アバター背後の切り欠き */
.avatarBack {
	position: absolute;
	top: 32px;
	left: 0;
	right: 0;
	width: 70px;
	height: 70px;
	margin: 0 auto;
	border-radius: 100%;
	background: var(--mfm-theme-popup, Canvas);
}

.avatar {
	position: absolute;
	top: 38px;
	left: 0;
	right: 0;
	z-index: 2;
	display: block;
	width: 58px;
	height: 58px;
	margin: 0 auto;
	border-radius: 100%;
	object-fit: cover;
}

.title {
	position: relative;
	z-index: 3;
	display: block;
	margin-top: 16px;
	padding: 8px 26px 16px 26px;
	text-align: center;
}

.name {
	display: inline-block;
	font-weight: bold;
	word-break: break-all;
	color: inherit;
	text-decoration: none;
}

.username {
	display: block;
	font-size: 0.8em;
	opacity: 0.7;
}

.description {
	padding: 16px 26px;
	font-size: 0.8em;
	text-align: center;
	border-top: solid 1px var(--mfm-theme-divider, rgba(128, 128, 128, 0.25));
	border-bottom: solid 1px var(--mfm-theme-divider, rgba(128, 128, 128, 0.25));
}

.mfm {
	display: -webkit-box;
	-webkit-line-clamp: 5;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.empty {
	opacity: 0.7;
}

.status {
	padding: 16px 26px;
}

.statusItem {
	display: inline-block;
	width: 33%;
	text-align: center;
}

.statusItemLabel {
	font-size: 0.7em;
	color: color-mix(in srgb, var(--mfm-theme-fg, currentColor) 75%, transparent);
}
</style>

<style scoped src="../../styles/base.css"></style>

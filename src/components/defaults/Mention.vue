<script setup lang="ts">
import { ref, watch } from 'vue';
import punycode from 'punycode.js';
import { useMfmContext } from '../../context.js';
import { handleLinkClick } from '../../navigation.js';
import { loadUserPreview, useHoverPopup } from '../../preview.js';
import UserPreviewPopup from './UserPreviewPopup.vue';
import type { MfmUserPreview } from '../../types/index.js';
import type { MfmMentionProps } from '../../types/index.js';

const props = defineProps<MfmMentionProps>();
const ctx = useMfmContext();
const el = ref<HTMLElement | null>(null);
const preview = useHoverPopup<MfmUserPreview>(
	el,
	() => {
		const fetcher = ctx.value.userPreview;
		if (!fetcher) return null;
		return loadUserPreview(fetcher, {
			username: props.username,
			host: props.isSourceHost ? null : props.host,
		});
	},
	{ interactive: true },
);

const errored = ref(false);
watch(
	() => props.avatarUrl,
	() => {
		errored.value = false;
	},
);
</script>

<template>
<a
	ref="el"
	class="mfm-mention"
	:class="{ me: isMe }"
	:href="href"
	@click="handleLinkClick($event, href, ctx)"
>
	<span v-if="errored" class="avatar placeholder"></span>
	<img
		v-else
		class="avatar"
		:src="avatarUrl"
		alt=""
		decoding="async"
		referrerpolicy="no-referrer"
		@error="errored = true"
	/>
	<span>
		<span>@{{ username }}</span>
		<span v-if="!isSourceHost && host" class="host">@{{ punycode.toUnicode(host) }}</span>
	</span>
	<Teleport v-if="preview.showing.value && (preview.loading.value || preview.data.value)" to="body">
		<UserPreviewPopup
			:anchor="el"
			:href="href"
			:loading="preview.loading.value"
			:data="preview.data.value"
			@mouseover="preview.popupListeners.onMouseover"
			@mouseleave="preview.popupListeners.onMouseleave"
		/>
	</Teleport>
</a>
</template>

<style scoped>
.mfm-mention {
	display: inline-block;
	padding: 4px 8px 4px 4px;
	border-radius: 999px;
	color: var(--mfm-theme-mention, var(--mfm-theme-accent, #86b300));
	background: color-mix(in srgb, currentColor 10%, transparent);
	text-decoration: none;
}

.me {
	color: var(--mfm-theme-mentionMe, var(--mfm-theme-mention, var(--mfm-theme-accent, #86b300)));
}

.avatar {
	width: 1.5em;
	height: 1.5em;
	margin: 0 0.2em 0 0;
	border-radius: 100%;
	object-fit: cover;
	vertical-align: bottom;
}

.placeholder {
	display: inline-block;
	background: color-mix(in srgb, currentColor 25%, transparent);
}
</style>

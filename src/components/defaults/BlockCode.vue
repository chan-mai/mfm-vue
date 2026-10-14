<script setup lang="ts">
import { computed, h, onMounted, ref, shallowRef, watch } from 'vue';
import { useMfmContext } from '../../context.js';
import { highlightCode } from '../../highlight.js';
import { fallbackCodeTheme } from '../../theme.js';
import Icon from './Icon.vue';
import type { HighlightResult } from '../../highlight.js';
import type { MfmBlockCodeProps } from '../../types/index.js';

const props = defineProps<MfmBlockCodeProps>();
const ctx = useMfmContext();

const show = ref(!ctx.value.dataSaver.code);
const highlighted = shallowRef<HighlightResult | null>(null);
let seq = 0;

// NOTE: SSRとハイドレーション一致のためマウント後処理
onMounted(() => {
	watch(
		[
			() => props.code,
			() => props.lang,
			() => ctx.value.highlight,
			() => ctx.value.lightTheme?.code ?? fallbackCodeTheme('light'),
			() => ctx.value.darkTheme?.code ?? fallbackCodeTheme('dark'),
		],
		async ([code, lang, options, light, dark]) => {
			const current = ++seq;
			if (!options) {
				highlighted.value = null;
				return;
			}
			try {
				const result = await highlightCode(code, lang, {
					light,
					dark,
					defaultLang: options.defaultLang,
				});
				if (current === seq) highlighted.value = result;
			} catch {
				if (current === seq) highlighted.value = null;
			}
		},
		{ immediate: true },
	);
});

const schemeClass = computed(() => `scheme-${ctx.value.colorScheme}`);

// NOTE: pre内の空白を増やさないため
const CodeBody = () =>
	h(
		'code',
		{ 'data-lang': props.lang ?? undefined },
		highlighted.value
			? highlighted.value.lines.flatMap((line, i) => [
				i > 0 ? '\n' : null,
				...line.map((t) => h('span', { style: t.style }, t.content)),
			])
			: props.code,
	);

// 通知表示はI/Fのみでい
async function copy() {
	let success = false;
	try {
		await navigator.clipboard.writeText(props.code);
		success = true;
	} catch {
		success = false;
	}
	ctx.value.onCopy?.({ text: props.code, success });
}
</script>

<template>
<div class="mfm-block-code" :class="schemeClass">
	<template v-if="show">
		<button
			class="copy"
			type="button"
			:title="ctx.messages.copy"
			:aria-label="ctx.messages.copy"
			@click="copy"
		>
			<Icon name="copy"/>
		</button>
		<pre
			class="pre"
			:class="{ hl: highlighted }"
			tabindex="0"
			:style="highlighted?.rootStyle"
		><CodeBody/></pre>
	</template>
	<button v-else class="placeholder" type="button" @click="show = true">
		<div><Icon name="code"/> {{ ctx.messages.code }}</div>
		<div>{{ ctx.messages.clickToShow }}</div>
	</button>
</div>
</template>

<style scoped>
.mfm-block-code {
	position: relative;
}

.copy {
	position: absolute;
	top: 8px;
	right: 8px;
	padding: 0;
	border: none;
	background: none;
	color: inherit;
	font: inherit;
	opacity: 0.5;
	cursor: pointer;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
	-webkit-tap-highlight-color: transparent;
}

.copy:hover {
	opacity: 0.8;
}

.pre {
	display: block;
	margin: 0;
	padding: 1em;
	border: 1px solid var(--mfm-theme-divider, rgba(128, 128, 128, 0.25));
	border-radius: 8px;
	overflow: auto;
	color: var(--mfm-theme-fg, currentColor);
	background: var(--mfm-theme-bg, rgba(128, 128, 128, 0.1));
	white-space: pre;
	font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
}

.pre :deep(code) {
	font-family: inherit;
}

.scheme-light .hl,
.scheme-auto .hl {
	color: var(--shiki-light);
	background-color: var(--shiki-light-bg);
}

.scheme-light .hl :deep(span),
.scheme-auto .hl :deep(span) {
	color: var(--shiki-light);
	font-style: var(--shiki-light-font-style);
	font-weight: var(--shiki-light-font-weight);
	text-decoration: var(--shiki-light-text-decoration);
}

.scheme-dark .hl {
	color: var(--shiki-dark);
	background-color: var(--shiki-dark-bg);
}

.scheme-dark .hl :deep(span) {
	color: var(--shiki-dark);
	font-style: var(--shiki-dark-font-style);
	font-weight: var(--shiki-dark-font-weight);
	text-decoration: var(--shiki-dark-text-decoration);
}

@media (prefers-color-scheme: dark) {
	.scheme-auto .hl {
		color: var(--shiki-dark);
		background-color: var(--shiki-dark-bg);
	}

	.scheme-auto .hl :deep(span) {
		color: var(--shiki-dark);
		font-style: var(--shiki-dark-font-style);
		font-weight: var(--shiki-dark-font-weight);
		text-decoration: var(--shiki-dark-text-decoration);
	}
}

.placeholder {
	display: block;
	box-sizing: border-box;
	width: 100%;
	margin-top: 4px;
	padding: 24px;
	border: none;
	border-radius: 8px;
	outline: none;
	font: inherit;
	text-align: center;
	color: var(--mfm-theme-fg, currentColor);
	background: var(--mfm-theme-bg, rgba(128, 128, 128, 0.1));
	cursor: pointer;
}

.placeholder > div {
	font-size: 0.8em;
}
</style>

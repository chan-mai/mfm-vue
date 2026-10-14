<script lang="ts">
import { computed, defineComponent, h, provide } from 'vue';
import * as mfm from 'mfm-js';
import { mergeMfmOptions, resolveMfmOptions, useMfmConfig } from '../config.js';
import { mfmContextKey } from '../context.js';
import { renderMfmNodes } from '../render/index.js';
import { themeAttrs } from '../theme-attrs.js';
import type { MfmNode } from 'mfm-js';
import type { PropType, SlotsType } from 'vue';
import type {
	MfmAuthor,
	MfmComponents,
	MfmCustomEmojiResolver,
	MfmColorScheme,
	MfmCopyEvent,
	MfmDataSaver,
	MfmTheme,
	MfmUserPreviewFetcher,
	MfmEmojiStyle,
	MfmFnHandler,
	MfmPaths,
	MfmUrlPreviewFetcher,
	MfmViewer,
	MfmHighlightOptions,
	MfmMessagesInput,
	MfmOptions,
	MfmSlots,
} from '../types/index.js';

// 描画関数で生成, 子孫要素にもscope属性付与
export default defineComponent({
	name: 'Mfm',
	props: {
		text: { type: String, default: '' },
		// 指定時はtextの解析省略
		nodes: { type: Array as PropType<MfmNode[] | null>, default: null },
		// 絵文字とテキストのみ解析, 改行は空白化
		plain: { type: Boolean, default: false },
		nowrap: { type: Boolean, default: false },
		nestLimit: { type: Number, default: undefined },
		instanceUrl: { type: String, default: undefined },
		author: { type: Object as PropType<MfmAuthor | null>, default: undefined },
		emojiUrls: {
			type: Object as PropType<Record<string, string> | null>,
			default: undefined,
		},
		customEmojis: {
			type: [Object, Function] as PropType<
				Record<string, string> | MfmCustomEmojiResolver | null
			>,
			default: undefined,
		},
		unicodeEmojiUrl: {
			type: Function as PropType<((emoji: string) => string | null) | null>,
			default: undefined,
		},
		emojiStyle: {
			type: String as PropType<MfmEmojiStyle>,
			default: undefined,
		},
		advanced: { type: Boolean, default: undefined },
		animated: {
			type: [Boolean, String] as PropType<boolean | 'auto'>,
			default: undefined,
		},
		isNote: { type: Boolean, default: undefined },
		nyaize: {
			type: [Boolean, String] as PropType<boolean | 'respect'>,
			default: undefined,
		},
		rootScale: { type: Number, default: undefined },
		locale: { type: String, default: undefined },
		messages: {
			type: Object as PropType<MfmMessagesInput>,
			default: undefined,
		},
		highlight: {
			type: [Boolean, Object] as PropType<MfmHighlightOptions | boolean>,
			default: undefined,
		},
		me: { type: Object as PropType<MfmViewer | null>, default: undefined },
		urlPreview: {
			type: Function as PropType<MfmUrlPreviewFetcher | null>,
			default: undefined,
		},
		navigate: {
			type: Function as PropType<
				((path: string, event: MouseEvent) => void) | null
			>,
			default: undefined,
		},
		paths: { type: Object as PropType<MfmPaths>, default: undefined },
		searchEngine: { type: String, default: undefined },
		mediaProxy: {
			type: String as PropType<string | null>,
			default: undefined,
		},
		disableAnimatedImages: { type: Boolean, default: undefined },
		userPreview: {
			type: Function as PropType<MfmUserPreviewFetcher | null>,
			default: undefined,
		},
		colorScheme: {
			type: String as PropType<MfmColorScheme>,
			default: undefined,
		},
		lightTheme: {
			type: [Object, String] as PropType<MfmTheme | string | null>,
			default: undefined,
		},
		darkTheme: {
			type: [Object, String] as PropType<MfmTheme | string | null>,
			default: undefined,
		},
		dataSaver: { type: Object as PropType<MfmDataSaver>, default: undefined },
		baseThemes: {
			type: Array as PropType<(MfmTheme | string)[]>,
			default: undefined,
		},
		components: {
			type: Object as PropType<Partial<MfmComponents>>,
			default: undefined,
		},
		fns: {
			type: Object as PropType<Record<string, MfmFnHandler | false>>,
			default: undefined,
		},
	},
	emits: {
		clickEv: (ev: string) => typeof ev === 'string',
		copy: (event: MfmCopyEvent) => typeof event.text === 'string',
	},
	slots: Object as SlotsType<MfmSlots>,
	setup(props, { emit, slots }) {
		const injected = useMfmConfig();

		const ast = computed<readonly MfmNode[]>(() => {
			if (props.nodes) return props.nodes;
			if (!props.text) return [];
			if (props.plain) return mfm.parseSimple(props.text);
			return mfm.parse(
				props.text,
				props.nestLimit != null ? { nestLimit: props.nestLimit } : {},
			);
		});

		const options = computed(() => {
			const local: MfmOptions = {
				instanceUrl: props.instanceUrl,
				author: props.author,
				emojiUrls: props.emojiUrls,
				customEmojis: props.customEmojis,
				unicodeEmojiUrl: props.unicodeEmojiUrl,
				emojiStyle: props.emojiStyle,
				advanced: props.advanced,
				animated: props.animated,
				isNote: props.isNote,
				nyaize: props.nyaize,
				rootScale: props.rootScale,
				locale: props.locale,
				messages: props.messages,
				highlight: props.highlight,
				me: props.me,
				urlPreview: props.urlPreview,
				navigate: props.navigate,
				paths: props.paths,
				searchEngine: props.searchEngine,
				mediaProxy: props.mediaProxy,
				disableAnimatedImages: props.disableAnimatedImages,
				userPreview: props.userPreview,
				colorScheme: props.colorScheme,
				lightTheme: props.lightTheme,
				darkTheme: props.darkTheme,
				dataSaver: props.dataSaver,
				baseThemes: props.baseThemes,
				components: props.components,
				fns: props.fns,
			};
			const resolved = resolveMfmOptions(mergeMfmOptions(injected(), local));
			return {
				...resolved,
				onCopy: (event: MfmCopyEvent) => {
					emit('copy', event);
					resolved.onCopy?.(event);
				},
			};
		});

		provide(mfmContextKey, options);

		function emitClick(ev: string) {
			emit('clickEv', ev);
			options.value.onClickEv?.(ev);
		}

		return () => {
			if (ast.value.length === 0) return null;
			const theme = themeAttrs(options.value);
			return h(
				'span',
				{
					class: [
						'mfm',
						'mfm-base',
						theme.class,
						{
							'mfm-nowrap': props.nowrap,
							'mfm-motion-auto': options.value.motionAuto,
						},
					],
					style: theme.style,
				},
				renderMfmNodes(ast.value, {
					options: options.value,
					plain: props.plain,
					nowrap: props.nowrap,
					slots: slots as MfmSlots,
					emitClick,
				}),
			);
		};
	},
});
</script>

<style scoped src="../styles/base.css"></style>
<style scoped src="../styles/format.css"></style>
<style scoped src="../styles/fn.css"></style>
<style scoped src="../styles/animation.css"></style>

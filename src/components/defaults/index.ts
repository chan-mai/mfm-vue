import BlockCode from './BlockCode.vue';
import CustomEmoji from './CustomEmoji.vue';
import Hashtag from './Hashtag.vue';
import InlineCode from './InlineCode.vue';
import Link from './Link.vue';
import MathBlock from './MathBlock.vue';
import MathInline from './MathInline.vue';
import Mention from './Mention.vue';
import Search from './Search.vue';
import Sparkle from './Sparkle.vue';
import UnicodeEmoji from './UnicodeEmoji.vue';
import Unixtime from './Unixtime.vue';
import Url from './Url.vue';
import type { MfmComponents } from '../../types/index.js';

export {
	BlockCode as MfmDefaultBlockCode,
	CustomEmoji as MfmDefaultCustomEmoji,
	Hashtag as MfmDefaultHashtag,
	InlineCode as MfmDefaultInlineCode,
	Link as MfmDefaultLink,
	MathBlock as MfmDefaultMathBlock,
	MathInline as MfmDefaultMathInline,
	Mention as MfmDefaultMention,
	Search as MfmDefaultSearch,
	Sparkle as MfmSparkle,
	UnicodeEmoji as MfmDefaultUnicodeEmoji,
	Unixtime as MfmDefaultUnixtime,
	Url as MfmDefaultUrl,
};

export const defaultComponents: MfmComponents = {
	url: Url,
	link: Link,
	mention: Mention,
	hashtag: Hashtag,
	customEmoji: CustomEmoji,
	unicodeEmoji: UnicodeEmoji,
	inlineCode: InlineCode,
	blockCode: BlockCode,
	mathInline: MathInline,
	mathBlock: MathBlock,
	search: Search,
	unixtime: Unixtime,
	sparkle: Sparkle,
};

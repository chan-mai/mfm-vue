import type { Component, VNodeChild } from 'vue';

export interface MfmUrlProps {
	url: string;
	rel: string;
	external: boolean;
}

export interface MfmLinkProps {
	url: string;
	rel: string;
	external: boolean;
	silent: boolean;
}

export interface MfmMentionProps {
	username: string;
	// instanceUrl未指定の取得元サーバ所属時はnull
	host: string | null;
	isSourceHost: boolean;
	// 取得元サーバ所属は@user, 他は@user@host
	acct: string;
	href: string;
	avatarUrl: string;
	// me未指定時は常にfalse
	isMe: boolean;
}

export interface MfmHashtagProps {
	hashtag: string;
	href: string;
}

export interface MfmCustomEmojiProps {
	name: string;
	// instanceUrl未指定の取得元サーバ絵文字はnull
	host: string | null;
	isSourceHost: boolean;
	url: string | null;
	normal: boolean;
	useOriginalSize: boolean;
}

export interface MfmUnicodeEmojiProps {
	emoji: string;
	// nullは文字のまま表示
	url: string | null;
}

export interface MfmInlineCodeProps {
	code: string;
}

export interface MfmBlockCodeProps {
	code: string;
	lang: string | null;
}

export interface MfmMathProps {
	formula: string;
}

export interface MfmSearchProps {
	query: string;
	content: string;
}

export interface MfmUnixtimeProps {
	time: number;
}

export interface MfmComponentPropsMap {
	url: MfmUrlProps;
	link: MfmLinkProps;
	mention: MfmMentionProps;
	hashtag: MfmHashtagProps;
	customEmoji: MfmCustomEmojiProps;
	unicodeEmoji: MfmUnicodeEmojiProps;
	inlineCode: MfmInlineCodeProps;
	blockCode: MfmBlockCodeProps;
	mathInline: MfmMathProps;
	mathBlock: MfmMathProps;
	search: MfmSearchProps;
	unixtime: MfmUnixtimeProps;
	sparkle: Record<never, never>;
}

export type MfmComponentName = keyof MfmComponentPropsMap;

// link, sparkleの子要素はdefaultスロット
export type MfmComponents = {
	[K in MfmComponentName]: Component<Partial<MfmComponentPropsMap[K]>>;
};

// 子要素を持たない構文のみスロットで差し替え可能
export type MfmSlotName = Exclude<MfmComponentName, 'link' | 'sparkle'>;

export type MfmSlots = {
	[K in MfmSlotName]?: (props: MfmComponentPropsMap[K]) => VNodeChild;
};

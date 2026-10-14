import type { MfmComponents } from './components.js';
import type { MfmFnHandler } from './fn.js';
import type { MfmMessages, MfmMessagesInput } from './i18n.js';
import type { MfmUrlPreviewFetcher, MfmUserPreviewFetcher } from './preview.js';
import type { MfmColorScheme, MfmTheme, ResolvedMfmTheme } from './theme.js';

export interface MfmAuthor {
	host?: string | null;
	isCat?: boolean;
}

// host nullは取得元サーバの絵文字
export type MfmCustomEmojiResolver = (
	name: string,
	host: string | null,
) => string | null | undefined;

export interface MfmHighlightOptions {
	// 言語未指定, 未対応時の言語
	defaultLang?: string;
}

export interface MfmDataSaver {
	// mediaProxy経由で静止画化
	avatar?: boolean;
	urlPreviewThumbnail?: boolean;
	// クリックまでコードブロックを非表示
	code?: boolean;
}

export type MfmEmojiStyle = 'twemoji' | 'fluentEmoji' | 'native';

export interface MfmViewer {
	username: string;
	// nullは取得元サーバ所属
	host?: string | null;
}

export interface MfmPaths {
	// acctは@userまたは@user@host
	user?: (acct: string) => string;
	hashtag?: (tag: string, isNote: boolean) => string;
}

export interface MfmCopyEvent {
	text: string;
	success: boolean;
}

export interface MfmOptions {
	// 取得元サーバ, 未指定時はルート相対パス
	instanceUrl?: string;
	author?: MfmAuthor | null;
	// ノートのemojisフィールド相当
	emojiUrls?: Record<string, string> | null;
	customEmojis?: Record<string, string> | MfmCustomEmojiResolver | null;
	// 既定はtwemoji
	emojiStyle?: MfmEmojiStyle;
	// emojiStyleより優先, nullは文字のまま
	unicodeEmojiUrl?: ((emoji: string) => string | null) | null;
	// MisskeyのadvancedMfm設定相当
	advanced?: boolean;
	// autoはprefers-reduced-motionに追従
	animated?: boolean | 'auto';
	// falseはハッシュタグのリンク先を/user-tags
	isNote?: boolean;
	// respectはauthor.isCatがtrueの場合のみ
	nyaize?: boolean | 'respect';
	rootScale?: number;
	components?: Partial<MfmComponents>;
	// falseは組み込み関数を無効化
	fns?: Record<string, MfmFnHandler | false>;
	onClickEv?: (ev: string) => void;
	// BCP 47, 既定はen-US
	locale?: string;
	messages?: MfmMessagesInput;
	// falseはコードブロックのハイライト無効
	highlight?: MfmHighlightOptions | boolean;
	// 閲覧者, 指定時のみ本人へのメンションを色分け
	me?: MfmViewer | null;
	// 指定時のみURLホバーでプレビュー表示
	urlPreview?: MfmUrlPreviewFetcher | null;
	// 指定時のみメンションホバーでユーザ情報表示
	userPreview?: MfmUserPreviewFetcher | null;
	// 既定はlight
	colorScheme?: MfmColorScheme;
	// 文字列はJSON5, 未指定時は部品の既定色
	lightTheme?: MfmTheme | string | null;
	darkTheme?: MfmTheme | string | null;
	// _light, _dark相当, baseとidで照合
	baseThemes?: (MfmTheme | string)[];
	dataSaver?: MfmDataSaver;
	// 取得元サーバ内リンクのクリック時, pathは/始まり
	navigate?: ((path: string, event: MouseEvent) => void) | null;
	paths?: MfmPaths;
	onCopy?: (event: MfmCopyEvent) => void;
	// {query}を検索語へ置換, 既定はGoogle
	searchEngine?: string;
	// Misskeyのメディアプロキシのオリジン
	mediaProxy?: string | null;
	// mediaProxy経由で静止画化
	disableAnimatedImages?: boolean;
}

export interface ResolvedMfmOptions {
	instanceUrl: string | null;
	sourceHost: string | null;
	author: MfmAuthor | null;
	emojiUrls: Record<string, string> | null;
	customEmojis: Record<string, string> | MfmCustomEmojiResolver | null;
	unicodeEmojiUrl: ((emoji: string) => string | null) | null;
	advanced: boolean;
	animated: boolean;
	// prefers-reduced-motionに追従
	motionAuto: boolean;
	isNote: boolean;
	nyaize: boolean;
	rootScale: number;
	components: MfmComponents;
	fns: Record<string, MfmFnHandler | false>;
	onClickEv: ((ev: string) => void) | null;
	locale: string;
	messages: MfmMessages;
	highlight: Required<MfmHighlightOptions> | false;
	me: MfmViewer | null;
	urlPreview: MfmUrlPreviewFetcher | null;
	userPreview: MfmUserPreviewFetcher | null;
	colorScheme: MfmColorScheme;
	// テーマ未指定時はnull
	lightTheme: ResolvedMfmTheme | null;
	darkTheme: ResolvedMfmTheme | null;
	baseThemes: MfmTheme[];
	dataSaver: Required<MfmDataSaver>;
	// マージ済みの元設定, 入れ子の<Mfm>へ引き継ぎ
	source: MfmOptions;
	navigate: ((path: string, event: MouseEvent) => void) | null;
	paths: Required<MfmPaths>;
	onCopy: ((event: MfmCopyEvent) => void) | null;
	searchEngine: string;
	mediaProxy: string | null;
	disableAnimatedImages: boolean;
}

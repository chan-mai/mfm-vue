// 本家サマリ互換
export interface MfmUrlPreview {
	url: string;
	title: string | null;
	description: string | null;
	thumbnail: string | null;
	icon: string | null;
	sitename: string | null;
	sensitive?: boolean;
}

export type MfmUrlPreviewFetcher = (url: string) => Promise<MfmUrlPreview | null>;

// Misskeyのusers/showの応答の一部
export interface MfmUserPreview {
	username: string;
	host: string | null;
	name: string | null;
	avatarUrl: string | null;
	bannerUrl: string | null;
	description: string | null;
	notesCount: number;
	// 非公開時はnull
	followingCount: number | null;
	followersCount: number | null;
	isCat?: boolean;
	// 名前, 自己紹介内の絵文字
	emojis?: Record<string, string>;
}

// host nullは取得元サーバ所属
export type MfmUserPreviewFetcher = (user: {
	username: string;
	host: string | null;
}) => Promise<MfmUserPreview | null>;

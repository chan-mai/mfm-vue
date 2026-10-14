export type MfmRelativeTimeUnit =
	| 'seconds'
	| 'minutes'
	| 'hours'
	| 'days'
	| 'weeks'
	| 'months'
	| 'years';

// {n}数値置換, 相対時刻文言は省略可
export interface MfmMessages {
	search: string;
	copy: string;
	failedToPreviewUrl: string;
	code: string;
	clickToShow: string;
	notes: string;
	following: string;
	followers: string;
	noAccountDescription: string;
	invalidTime: string;
	justNow?: string;
	ago?: Partial<Record<MfmRelativeTimeUnit, string>>;
	timeIn?: Partial<Record<MfmRelativeTimeUnit, string>>;
}

export type MfmMessagesInput = Partial<MfmMessages>;

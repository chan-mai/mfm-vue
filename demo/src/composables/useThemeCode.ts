import { parseThemeCode } from 'mfm-vue';

export interface ThemeCodeStatus {
	label: string;
	error: boolean;
}

export function themeCodeStatus(code: string): ThemeCodeStatus {
	if (!code.trim()) return { label: '未指定', error: false };
	try {
		const theme = parseThemeCode(code);
		return { label: `${theme.name} (${theme.base})`, error: false };
	} catch (error) {
		return { label: String(error), error: true };
	}
}

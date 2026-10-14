import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import tinycolor from 'tinycolor2';
import {
	Mfm,
	compileTheme,
	getThemeProps,
	parseThemeCode,
	resolveMfmOptions,
	resolveTheme,
	withBaseTheme,
} from '../src/index.js';
import { defined } from './helpers.js';
import type { MfmTheme } from '../src/index.js';

// テスト用テーマ デフォ
const BASE_LIGHT: MfmTheme = {
	id: 'light',
	props: {
		accent: '#86b300',
		accentedBg: ':alpha<0.15<@accent',
		bg: '#fff',
		fg: '#5f5f5f',
		divider: 'rgba(0, 0, 0, 0.1)',
		panel: ':lighten<3<@bg',
		popup: ':lighten<3<@panel',
		shadow: 'rgba(0, 0, 0, 0.1)',
		header: ':alpha<0.7<@panel',
		link: '#44a4c1',
		hashtag: '#ff9156',
		mention: '@accent',
		mentionMe: '@mention',
		renote: '#229e82',
		panelBorder: '" solid 1px var(--MI_THEME-divider)',
		XlegacyProp: '#000',
	},
	codeHighlighter: { base: 'catppuccin-latte' },
};
const BASE_DARK: MfmTheme = {
	id: 'dark',
	props: { ...BASE_LIGHT.props, bg: '#000', fg: '#dadada' },
	codeHighlighter: { base: 'one-dark-pro' },
};
const BASES = [BASE_LIGHT, BASE_DARK];
const themeProps = defined(getThemeProps(BASES));

// テスト用テーマ カスタマイズ済
const YORUSKEY_LIGHT = `{
	id: "a2e7f4b1-9c3d-4f8e-b5a2-1e6d3c7f0b9e",
	name: "よるすきー Light",
	author: "@mai_llj@misskey.blue",
	base: "light",
	desc: "ピンクと水色のパステルライトテーマ",
	props: {
		bg:                    "#f5f3fa",
		fg:                    "#7a6888",
		navBg:                 "@panel",
		panel:                 "#fff",
		popup:                 "#fff",
		accent:                "rgb(252, 159, 168)",
		header:                ":alpha<0.75<@panel",
		shadow:                "rgba(160, 140, 200, 0.15)",
		divider:               "rgba(200, 185, 225, 0.3)",
		hashtag:               "#7ac8e0",
		mention:               "@accent",
		mentionMe:             "@mention",
		accentedBg:            ":alpha<0.1<@accent",
		navHoverFg:            ":darken<10<@fg",
		panelBorder:           '" solid 1px var(--MI_THEME-divider)',
		buttonGradateB:        "#b9d9ffff",
	},
	codeHighlighter: {
		base: 'rose-pine-dawn',
	},
}`;

function rootStyle(props: Record<string, unknown>) {
	return defined(mount(Mfm, { props: { text: 'a', ...props } }).get('span.mfm').attributes('style'));
}

describe('parseThemeCode', () => {
	it('JSON5を解析し, id, name, baseを検証', () => {
		const theme = parseThemeCode(YORUSKEY_LIGHT);
		expect(theme.name).toBe('よるすきー Light');
		expect(() => parseThemeCode("{ id: 'x' }")).toThrow('This theme is invalid');
		expect(() => parseThemeCode('{')).toThrow('Failed to parse theme json');
	});
});

describe('getThemeProps', () => {
	it('id: lightのデフォテーマの項目からX始まりを除外, デフォテーマなしはnull', () => {
		expect(themeProps).toContain('renote');
		expect(themeProps).not.toContain('XlegacyProp');
		expect(getThemeProps([])).toBeNull();
	});
});

describe('compileTheme', () => {
	it('デフォテーマの全項目へ重ねて参照, 色関数を解決し, themePropsの項目のみ出力', () => {
		const colors = compileTheme(withBaseTheme(parseThemeCode(YORUSKEY_LIGHT), BASES), themeProps);
		expect(colors.bg).toBe('rgb(245, 243, 250)');
		expect(colors.mention).toBe('rgb(252, 159, 168)');
		expect(colors.accentedBg).toBe('rgba(252, 159, 168, 0.1)');
		expect(colors.header).toBe(tinycolor('#fff').setAlpha(0.75).toRgbString());
		expect(colors.panelBorder).toBe('solid 1px var(--MI_THEME-divider)');
		// デフォテーマ由来の項目
		expect(colors.link).toBe('rgb(68, 164, 193)');
		expect(colors.renote).toBe('rgb(34, 158, 130)');
		// デフォライトテーマにない項目は出力対象外
		expect(colors.navHoverFg).toBeUndefined();
		expect(Object.keys(colors).sort()).toEqual([...themeProps].sort());
	});

	it('デフォテーマなしの場合は重ねず全項目を出力', () => {
		const colors = compileTheme(parseThemeCode(YORUSKEY_LIGHT));
		expect(colors.navHoverFg).toBe(tinycolor('#7a6888').darken(10).toRgbString());
		expect(colors.link).toBeUndefined();
	});
});

describe('lightTheme, darkTheme', () => {
	it('テーマコードの文字列を受け付け, 各項目をCSS変数で出力', () => {
		const style = rootStyle({ lightTheme: YORUSKEY_LIGHT, baseThemes: BASES });
		expect(style).toContain('--mfm-theme-bg: rgb(245, 243, 250)');
		expect(style).toContain('--mfm-theme-hashtag: rgb(122, 200, 224)');
		expect(style).toContain('--mfm-theme-link: rgb(68, 164, 193)');
		expect(style).toContain('color-scheme: light');
		expect(style).toContain('color: var(--mfm-theme-fg)');
		for (const key of themeProps) expect(style).toContain(`--mfm-theme-${key}:`);
	});

	it('未指定時はCSS変数なし, color-schemeのみ設定', () => {
		const style = rootStyle({});
		expect(style).not.toContain('--mfm-theme-');
		expect(style).toContain('color-scheme: light');
		expect(style).not.toContain('color: var');
	});
});

describe('colorScheme', () => {
	it('autoの場合は両テーマの値をlight-dark()で出力', () => {
		const style = rootStyle({
			colorScheme: 'auto',
			baseThemes: BASES,
			lightTheme: { id: 'l', name: 'l', base: 'light', props: {} },
			darkTheme: { id: 'd', name: 'd', base: 'dark', props: {} },
		});
		expect(style).toContain('--mfm-theme-fg: light-dark(rgb(95, 95, 95), rgb(218, 218, 218))');
		// 同値はそのまま, 色以外の値はライト
		expect(style).toContain('--mfm-theme-link: rgb(68, 164, 193)');
		expect(style).toContain('--mfm-theme-panelBorder: solid 1px var(--mfm-theme-divider)');
		expect(style).toContain('color-scheme: light dark');
	});
});

describe('resolveTheme', () => {
	it('デフォルトテーマなしでfocus, fgOnAccent未定義の場合はデフォルトテーマと同じ値', () => {
		const theme: MfmTheme = { id: 'a', name: 'a', base: 'light', props: { accent: '#e36749' } };
		const { colors } = defined(resolveTheme(theme, 'light'));
		expect(colors.focus).toBe('rgba(227, 103, 73, 0.3)');
		expect(colors.fgOnAccent).toBe('rgb(255, 255, 255)');
	});

	it('不正なテーマは警告を出力しnull', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const r = resolveTheme(
			{ id: 'x', name: 'x', base: 'light', props: { accent: '@missing' } },
			'light',
			BASES,
		);
		expect(r).toBeNull();
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Theme references missing property'));
		warn.mockRestore();
	});

	it('codeHighlighterをデフォテーマと合成, 指定なしはdark-plus', () => {
		expect(defined(resolveTheme(YORUSKEY_LIGHT, 'light', BASES)).code).toMatchObject({
			base: 'rose-pine-dawn',
			name: 'rose-pine-dawn',
			type: 'light',
		});
		expect(
			defined(resolveTheme({ id: 'a', name: 'a', base: 'light', props: {} }, 'light', BASES)).code.base,
		).toBe('catppuccin-latte');
		// デフォテーマを渡さない場合は合成しない
		expect(
			defined(resolveTheme({ id: 'a', name: 'a', base: 'light', props: {} }, 'light')).code.base,
		).toBe('dark-plus');
	});
});

describe('resolveMfmOptions', () => {
	it('同一テーマ入力は解決結果を共有, オブジェクト変更時は再解決', () => {
		const options = { lightTheme: YORUSKEY_LIGHT, baseThemes: BASES };
		expect(resolveMfmOptions(options).lightTheme).toBe(
			resolveMfmOptions({ ...options }).lightTheme,
		);
		const theme: MfmTheme = { id: 't', name: 't', base: 'light', props: { fg: '#111' } };
		const before = defined(resolveMfmOptions({ lightTheme: theme }).lightTheme).colors.fg;
		theme.props.fg = '#222';
		expect(defined(resolveMfmOptions({ lightTheme: theme }).lightTheme).colors.fg).not.toBe(before);
	});
});

describe('codeHighlighter', () => {
	async function tokens(theme: string | object) {
		const w = mount(Mfm, {
			props: { text: '```js\nconst a = 1;\n```', lightTheme: theme as never, baseThemes: BASES },
		});
		await vi.waitFor(
			() => expect(w.findAll('.mfm-block-code pre span').length).toBeGreaterThan(0),
			{ timeout: 10000 },
		);
		return w;
	}

	it('baseの同梱テーマをコードブロックへ適用', { timeout: 30000 }, async () => {
		const w = await tokens(YORUSKEY_LIGHT);
		expect(w.get('.mfm-block-code pre').attributes('style')).toContain(
			'--shiki-light-bg: #faf4ed',
		);
	});

	it('overridesを同梱テーマへdeepMerge, _none_はoverridesのみ使用', { timeout: 30000 }, async () => {
		const merged = await tokens({
			id: 'o',
			name: 'o',
			base: 'light',
			props: {},
			codeHighlighter: { base: 'github-light', overrides: { colors: { 'editor.background': '#123456' } } },
		});
		expect(merged.get('.mfm-block-code pre').attributes('style')).toContain(
			'--shiki-light-bg: #123456',
		);
		const none = await tokens({
			id: 'n',
			name: 'n',
			base: 'light',
			props: {},
			codeHighlighter: {
				base: '_none_',
				overrides: {
					colors: { 'editor.background': '#abcdef', 'editor.foreground': '#010203' },
					tokenColors: [{ scope: ['keyword', 'storage'], settings: { foreground: '#ff0000' } }],
				},
			},
		});
		expect(none.get('.mfm-block-code pre').attributes('style')).toContain(
			'--shiki-light-bg: #abcdef',
		);
		const keyword = none.findAll('.mfm-block-code pre span').find((s) => s.text() === 'const');
		expect(keyword?.attributes('style')).toContain('--shiki-light: #FF0000');
	});
});

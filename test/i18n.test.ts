import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { builtinMessages, formatRelativeTime } from '../src/index.js';
import { defined, render } from './helpers.js';

const ja = defined(builtinMessages.ja);
const en = defined(builtinMessages.en);

afterEach(() => {
	vi.useRealTimers();
});

describe('formatRelativeTime', () => {
	it('-3秒以上10秒未満はjustNow', () => {
		expect(formatRelativeTime(0, ja)).toBe('たった今');
		expect(formatRelativeTime(9, ja)).toBe('たった今');
	});

	it('分, 秒は切り捨て', () => {
		expect(formatRelativeTime(42, ja)).toBe('42秒前');
		expect(formatRelativeTime(119, ja)).toBe('1分前');
	});

	it('時以上は四捨五入', () => {
		expect(formatRelativeTime(5400, ja)).toBe('2時間前');
		expect(formatRelativeTime(604800 * 2, ja)).toBe('2週間前');
		expect(formatRelativeTime(31536000 * 2.6, ja)).toBe('3年前');
	});

	it('負数は未来の表記', () => {
		expect(formatRelativeTime(-86400 * 3, ja)).toBe('3日後');
		expect(formatRelativeTime(-30, en)).toBe('In 30s');
	});

	it('相対時刻の文言がない言語はIntl.RelativeTimeFormatの表記', () => {
		const ko = defined(builtinMessages.ko);
		expect(ko.search).toBe('검색');
		expect(formatRelativeTime(7200, ko, 'ko-KR')).toBe(
			new Intl.RelativeTimeFormat('ko-KR', { numeric: 'auto' }).format(-2, 'hours'),
		);
	});
});

describe('locale', () => {
	it('未指定時は英語の文言', () => {
		expect(render('a 検索').get('.mfm-search button').text()).toBe('Search');
	});

	it('言語部分で同梱の文言を選択', () => {
		expect(render('a 検索', { locale: 'ja-JP' }).get('.mfm-search button').text()).toBe('検索');
		expect(render('```\nx\n```', { locale: 'ja' }).get('.copy').attributes('title')).toBe(
			'コピー',
		);
	});

	it('unixtimeの日時と相対時刻へ反映', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-10-15T00:00:00Z'));
		const w = render('$[unixtime 1700000000]', { locale: 'ja-JP' });
		await nextTick();
		expect(w.get('time').text()).toMatch(/\(3年前\)$/);
	});
});

describe('messages', () => {
	it('同梱外の言語でも指定した文言で上書き', () => {
		const w = render('a 検索', { locale: 'fr-FR', messages: { search: 'Rechercher' } });
		expect(w.get('.mfm-search button').text()).toBe('Rechercher');
	});
});

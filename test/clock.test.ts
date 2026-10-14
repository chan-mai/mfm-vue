import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { Mfm } from '../src/index.js';

afterEach(() => {
	vi.useRealTimers();
});

describe('useLowresNow', () => {
	it('10秒間隔で更新, unmount時にタイマー停止', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-10-15T00:00:00Z'));
		const sec = Date.UTC(2026, 9, 15) / 1000;
		const w = mount(Mfm, {
			props: { text: `$[unixtime ${sec}]`, locale: 'ja-JP' },
		});
		await nextTick();
		expect(w.get('time').text()).toMatch(/\(たった今\)$/);
		vi.advanceTimersByTime(60_000);
		await nextTick();
		expect(w.get('time').text()).toMatch(/\(1分前\)$/);
		w.unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});

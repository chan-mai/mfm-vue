import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { Mfm, createUserPreviewFetcher } from '../../src/index.js';
import { defined } from '../helpers.js';

describe('userPreview', () => {
	it('メンションのホバーで名前, 自己紹介, 公開中の数を表示', async () => {
		const fetcher = vi.fn().mockResolvedValue({
			username: 'bob',
			host: 'remote.example',
			name: 'Bob :em:',
			avatarUrl: 'https://cdn/avatar.png',
			bannerUrl: null,
			description: '**hello**',
			notesCount: 1234,
			followingCount: null,
			followersCount: 56,
			emojis: { em: 'https://cdn/em.png' },
		});
		const w = mount(Mfm, {
			props: {
				text: '@bob@remote.example',
				instanceUrl: 'https://misskey.example',
				userPreview: fetcher,
			},
			attachTo: document.body,
		});
		await w.get('a.mfm-mention').trigger('mouseover');
		await vi.waitFor(() => {
			const popup = document.querySelector('.mfm-user-preview');
			expect(popup?.querySelector('.name img')?.getAttribute('src')).toBe('https://cdn/em.png');
			expect(popup?.querySelector('.description b')?.textContent).toBe('hello');
		});
		const popup = defined(document.querySelector('.mfm-user-preview'));
		expect(popup.querySelector('.username')?.textContent).toBe('@bob@remote.example');
		const items = [...popup.querySelectorAll('.statusItem')].map((item) => item.textContent);
		expect(items).toEqual(['Notes1,234', 'Followers56']);
		expect(fetcher).toHaveBeenCalledWith({ username: 'bob', host: 'remote.example' });
		w.unmount();
	});
});

describe('createUserPreviewFetcher', () => {
	it('公開範囲がpublicのフォロー数, フォロワー数のみ返却', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				username: 'a',
				host: null,
				name: null,
				avatarUrl: null,
				bannerUrl: null,
				description: null,
				notesCount: 1,
				followingCount: 2,
				followersCount: 3,
				followingVisibility: 'followers',
				followersVisibility: 'public',
			}),
		});
		const r = await createUserPreviewFetcher('https://misskey.example/api/users/show', {
			// eslint-disable-next-line id-denylist
			fetch: fetchMock as unknown as typeof fetch,
		})({ username: 'a', host: null });
		expect(defined(fetchMock.mock.calls[0])[1].body).toBe('{"username":"a","host":null}');
		expect(r?.followingCount).toBeNull();
		expect(r?.followersCount).toBe(3);
	});
});

import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { Mfm } from '../../src/index.js';
import { defined, render } from '../helpers.js';

const INSTANCE = { instanceUrl: 'https://misskey.example' };

describe('mention', () => {
	it('取得元サーバのユーザはホスト表記なし', () => {
		const a = render('@alice', { instanceUrl: 'https://misskey.example/' }).get('a.mfm-mention');
		expect(a.attributes('href')).toBe('https://misskey.example/@alice');
		expect(a.text()).toBe('@alice');
	});

	it('リモートユーザはホスト表記付き', () => {
		const a = render('@bob@remote.example', INSTANCE).get('a.mfm-mention');
		expect(a.attributes('href')).toBe('https://misskey.example/@bob@remote.example');
		expect(a.text()).toBe('@bob@remote.example');
	});

	it('ホスト省略時は投稿者のホストで補完', () => {
		const w = render('@carol', { ...INSTANCE, author: { host: 'remote.example' } });
		expect(w.get('a.mfm-mention').text()).toBe('@carol@remote.example');
	});

	it('取得元サーバのホスト明記時はホスト表記なし', () => {
		expect(render('@dave@misskey.example', INSTANCE).get('a.mfm-mention').text()).toBe('@dave');
	});

	it('国際化ドメイン名のホストをUnicode表記', () => {
		expect(render('@bob@xn--r8jz45g.jp').get('.mfm-mention').text()).toBe('@bob@例え.jp');
	});

	it('スロットへ確定済みのホスト名を渡す', () => {
		const w = mount(Mfm, {
			props: { text: '@alice', ...INSTANCE },
			slots: {
				mention: (p: { host: string | null; isSourceHost: boolean }) =>
					h('span', { class: 'm' }, `${p.host}:${p.isSourceHost}`),
			},
		});
		expect(w.get('.m').text()).toBe('misskey.example:true');
	});

	it('paths.user指定時はリンク先パス変更', () => {
		const w = render('@alice@remote.example', {
			paths: { user: (acct) => `/users/${acct.slice(1)}` },
		});
		expect(w.get('a.mfm-mention').attributes('href')).toBe('/users/alice@remote.example');
	});
});

describe('アバター', () => {
	it('instanceUrl指定時は取得元サーバの/avatarを参照', () => {
		const imgs = render('@alice @bob@remote.example', INSTANCE).findAll('a.mfm-mention img');
		expect(defined(imgs[0]).attributes('src')).toBe(
			'https://misskey.example/avatar/@alice@misskey.example',
		);
		expect(defined(imgs[1]).attributes('src')).toBe('https://misskey.example/avatar/@bob@remote.example');
	});

	it('instanceUrl未指定時はルート相対パス', () => {
		const imgs = render('@alice @bob@remote.example').findAll('img');
		expect(defined(imgs[0]).attributes('src')).toBe('/avatar/@alice');
		expect(defined(imgs[1]).attributes('src')).toBe('/avatar/@bob@remote.example');
	});

	it('読み込み失敗時はプレースホルダー表示', async () => {
		const w = render('@alice');
		await w.get('img').trigger('error');
		expect(w.find('img').exists()).toBe(false);
		expect(w.find('.placeholder').exists()).toBe(true);
	});

	it('dataSaver.avatar指定時はメディアプロキシの静止画', () => {
		const w = render('@bob', {
			...INSTANCE,
			mediaProxy: 'https://proxy.example',
			dataSaver: { avatar: true },
		});
		expect(w.get('.mfm-mention img').attributes('src')).toContain(
			'https://proxy.example/static.webp?',
		);
	});
});

describe('me', () => {
	it('未指定時は本人判定なし', () => {
		expect(render('@alice', INSTANCE).get('a').classes()).not.toContain('me');
	});

	it('ユーザ名の大文字小文字とホストを考慮して本人判定', () => {
		const w = render('@alice @alice@remote.example @Alice@misskey.example', {
			...INSTANCE,
			me: { username: 'alice' },
		});
		expect(w.findAll('a.mfm-mention').map((a) => a.classes().includes('me'))).toEqual([
			true,
			false,
			true,
		]);
	});
});

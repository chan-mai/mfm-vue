import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import type { Plugin } from 'vite';

function instanceProxy(): Plugin {
	return {
		name: 'demo-instance-proxy',
		configureServer(server) {
			server.middlewares.use('/__proxy', async (req, res) => {
				const u = new URL(req.url ?? '', 'http://localhost');
				let origin: string;
				try {
					const instance = new URL(u.searchParams.get('instance') ?? '');
					if (instance.protocol !== 'https:') throw new Error('https only');
					origin = instance.origin;
				} catch {
					res.statusCode = 400;
					res.end('invalid instance');
					return;
				}
				let target: string;
				let init: RequestInit | undefined;
				if (u.pathname === '/users-show' && req.method === 'POST') {
					const chunks: Buffer[] = [];
					for await (const chunk of req) chunks.push(chunk as Buffer);
					target = `${origin}/api/users/show`;
					init = {
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: Buffer.concat(chunks).toString(),
					};
				} else if (u.pathname === '/emojis') {
					target = `${origin}/api/emojis`;
				} else if (u.pathname === '/url') {
					const params = new URLSearchParams();
					params.set('url', u.searchParams.get('url') ?? '');
					const lang = u.searchParams.get('lang');
					if (lang) params.set('lang', lang);
					target = `${origin}/url?${params}`;
				} else {
					res.statusCode = 404;
					res.end('not found');
					return;
				}
				try {
					const upstream = await fetch(target, init);
					res.statusCode = upstream.status;
					res.setHeader('content-type', 'application/json');
					res.end(await upstream.text());
				} catch (error) {
					res.statusCode = 502;
					res.end(String(error));
				}
			});
		},
	};
}

export default defineConfig({
	root: 'demo',
	base: './',
	plugins: [vue(), instanceProxy()],
	resolve: {
		alias: {
			'aiscript-grammar': fileURLToPath(
				new URL(
					'./vendor/aiscript-vscode/aiscript/syntaxes/aiscript.tmLanguage.json',
					import.meta.url,
				),
			),
		},
	},
	build: {
		outDir: '../dist-demo',
		emptyOutDir: true,
	},
});

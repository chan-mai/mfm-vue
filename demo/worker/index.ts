import { Hono } from 'hono';
import type { Context, Next } from 'hono';

// MisskeyのAPIを中継
const app = new Hono<{ Variables: { origin: string } }>().basePath('/api');

// instance指定はhttpsのみ
async function instance(c: Context<{ Variables: { origin: string } }>, next: Next) {
	try {
		const url = new URL(c.req.query('instance') ?? '');
		if (url.protocol !== 'https:') throw new Error('https only');
		c.set('origin', url.origin);
	} catch {
		return c.text('invalid instance', 400);
	}
	await next();
}

async function relay(target: string, init?: RequestInit): Promise<Response> {
	try {
		const upstream = await fetch(target, init);
		return new Response(await upstream.text(), {
			status: upstream.status,
			headers: { 'content-type': 'application/json' },
		});
	} catch (error) {
		return new Response(String(error), { status: 502 });
	}
}

app.use('*', instance);

app.get('/emojis', (c) => relay(`${c.get('origin')}/api/emojis`));

app.get('/url', (c) => {
	const params = new URLSearchParams({ url: c.req.query('url') ?? '' });
	const lang = c.req.query('lang');
	if (lang) params.set('lang', lang);
	return relay(`${c.get('origin')}/url?${params}`);
});

app.post('/users-show', async (c) =>
	relay(`${c.get('origin')}/api/users/show`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: await c.req.text(),
	}),
);

export default app;

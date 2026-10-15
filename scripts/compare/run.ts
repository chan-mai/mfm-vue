// Misskeyと<Mfm>をHeadless Chromeで比較
// usage: pnpm compare <note URL> [--width=<px>] [--eval=<expression using root>]
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { createServer } from 'vite';

type Rect = { x: number; y: number; w: number; h: number };
type Collected = {
	root: (Rect & { bottom: number }) | null;
	chars: (Rect & { ch: string; style: Record<string, string> })[];
	media: (Rect & {
		kind: string;
		src: string | null;
		alt: string | null;
		area?: number;
	})[];
	boxes: (Rect & {
		key: string;
		lines: number;
		style: Record<string, string>;
	})[];
	controls: { id: string; key: string; style: Record<string, string> }[];
	controlProps: string[];
};
type StateStyles = Record<string, Record<string, Record<string, string>>>;
type Page = {
	send: <T = unknown>(method: string, params?: object) => Promise<T>;
	evaluate: <T>(expression: string) => Promise<T>;
};
type Note = {
	text: string | null;
	cw: string | null;
	emojis?: Record<string, string>;
	user: { username: string; host: string | null; isCat?: boolean };
};

const TOLERANCE = 0.5;
// アイコンフォントはcanvas再描画のためラスタライズ誤差を許容
const ICON_TOLERANCE = 1;
const ICON_AREA_RATIO = 0.15;
const STATES = ['hover', 'focus-visible'];
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const collectSource = (await readFile(here('./collect.js'), 'utf8'))
	.trim()
	.replace(/;$/, '');

class Cdp {
	#ws: WebSocket;
	#id = 0;
	#pending = new Map<
		number,
		{ resolve: (value: unknown) => void; reject: (error: Error) => void }
	>();

	constructor(ws: WebSocket) {
		this.#ws = ws;
		ws.addEventListener('message', (event) => {
			const msg = JSON.parse(String(event.data));
			const pending = msg.id != null ? this.#pending.get(msg.id) : undefined;
			if (!pending) return;
			this.#pending.delete(msg.id);
			if (msg.error) pending.reject(new Error(msg.error.message));
			else pending.resolve(msg.result);
		});
	}

	static async connect(url: string): Promise<Cdp> {
		const ws = new WebSocket(url);
		await new Promise((resolve, reject) => {
			ws.addEventListener('open', resolve, { once: true });
			ws.addEventListener('error', reject, { once: true });
		});
		return new Cdp(ws);
	}

	send<T = unknown>(method: string, params: object = {}, sessionId?: string): Promise<T> {
		const id = ++this.#id;
		this.#ws.send(JSON.stringify({ id, method, params, sessionId }));
		return new Promise<T>((resolve, reject) =>
			this.#pending.set(id, { resolve: (value) => resolve(value as T), reject }),
		);
	}

	disconnect() {
		this.#ws.close();
	}
}

function chromePath(): string {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	for (const dir of (process.env.PATH ?? '').split(':')) {
		for (const name of ['google-chrome', 'google-chrome-stable', 'chromium']) {
			if (existsSync(join(dir, name))) return join(dir, name);
		}
	}
	return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

async function launchChrome() {
	const userDataDir = await mkdtemp(join(tmpdir(), 'mfm-vue-compare-'));
	const proc = spawn(
		chromePath(),
		[
			'--headless=new',
			'--remote-debugging-port=0',
			`--user-data-dir=${userDataDir}`,
			'--no-first-run',
			'--no-default-browser-check',
			'--lang=ja-JP',
			'about:blank',
		],
		{ stdio: 'ignore' },
	);
	const exited = new Promise((resolve) => proc.once('exit', resolve));
	let port: string | undefined;
	let path: string | undefined;
	for (let i = 0; i < 100 && !path; i++) {
		await sleep(100);
		try {
			[port, path] = (
				await readFile(join(userDataDir, 'DevToolsActivePort'), 'utf8')
			).split('\n');
		} catch {
			// DevToolsActivePort作成待ち
		}
	}
	const stopChrome = async () => {
		proc.kill();
		await exited;
		await rm(userDataDir, { recursive: true, force: true });
	};
	if (!port || !path) {
		await stopChrome();
		throw new Error('Failed to start Chrome');
	}
	const cdp = await Cdp.connect(`ws://127.0.0.1:${port}${path}`);
	return {
		cdp,
		async shutdown() {
			cdp.disconnect();
			await stopChrome();
		},
	};
}

async function openPage(
	cdp: Cdp,
	url: string,
	width: number,
	init?: string,
): Promise<Page> {
	const { targetId } = await cdp.send<{ targetId: string }>('Target.createTarget', {
		url: 'about:blank',
	});
	const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', {
		targetId,
		flatten: true,
	});
	const send = <T = unknown>(method: string, params?: object) =>
		cdp.send<T>(method, params, sessionId);
	await send('Page.enable');
	await send('DOM.enable');
	await send('CSS.enable');
	await send('Emulation.setDeviceMetricsOverride', {
		width,
		height: 2000,
		deviceScaleFactor: 1,
		mobile: false,
	});
	await send('Emulation.setEmulatedMedia', {
		features: [
			{ name: 'prefers-color-scheme', value: 'light' },
			{ name: 'prefers-reduced-motion', value: 'reduce' },
		],
	});
	if (init) {
		await send('Page.addScriptToEvaluateOnNewDocument', { source: init });
	}
	await send('Page.navigate', { url });
	return {
		send,
		async evaluate<T>(expression: string): Promise<T> {
			const res = await send<{
				result: { value: unknown };
				exceptionDetails?: { text: string; exception?: { description?: string } };
			}>('Runtime.evaluate', {
				expression,
				awaitPromise: true,
				returnByValue: true,
			});
			if (res.exceptionDetails) {
				throw new Error(
					res.exceptionDetails.exception?.description ??
						res.exceptionDetails.text,
				);
			}
			return res.result.value as T;
		},
	};
}

// 収集結果が2回連続で一致するまで待機
async function collectStable(page: Page, rootExpr: string): Promise<Collected> {
	let prev = '';
	for (let i = 0; i < 60; i++) {
		await sleep(500);
		const result = await page.evaluate<{
			data: Collected;
			json: string;
		} | null>(`(async () => {
			const root = ${rootExpr};
			if (!root) return null;
			await document.fonts.ready;
			if ([...root.querySelectorAll("img")].some((img) => !img.complete)) return null;
			const data = await (${collectSource})(root);
			return { data, json: JSON.stringify(data) };
		})()`);
		if (result && result.json === prev) return result.data;
		prev = result?.json ?? '';
	}
	throw new Error('Rendering did not settle');
}

async function stateStyles(
	page: Page,
	collected: Collected,
): Promise<StateStyles> {
	const { root } = await page.send<{ root: { nodeId: number } }>('DOM.getDocument', { depth: 0 });
	const out: StateStyles = {};
	for (const state of STATES) {
		const styles: StateStyles[string] = {};
		for (const control of collected.controls) {
			const selector = `[data-mfm-compare-control="${control.id}"]`;
			const { nodeId } = await page.send<{ nodeId: number }>('DOM.querySelector', {
				nodeId: root.nodeId,
				selector,
			});
			if (!nodeId) continue;
			await page.send('CSS.forcePseudoState', {
				nodeId,
				forcedPseudoClasses: [state],
			});
			styles[control.id] = await page.evaluate(`(() => {
				const s = getComputedStyle(document.querySelector(${JSON.stringify(selector)}));
				return Object.fromEntries(${JSON.stringify(collected.controlProps)}.map((p) => [p, s.getPropertyValue(p)]));
			})()`);
			await page.send('CSS.forcePseudoState', {
				nodeId,
				forcedPseudoClasses: [],
			});
		}
		out[state] = styles;
	}
	return out;
}

async function postJson<T>(url: string, body: object): Promise<T> {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	return (await res.json()) as T;
}

// 派生版のバージョンは本家のタグへ丸めて再試行
async function fetchThemes(version: string, defaultLightTheme: string | null) {
	const tags = [...new Set([version, version.replace(/-.*$/, '')])];
	for (const tag of tags) {
		const base = `https://raw.githubusercontent.com/misskey-dev/misskey/${tag}/packages/frontend-shared/themes`;
		const files = await Promise.all(
			['_light', '_dark', 'l-light'].map(async (name) => {
				const res = await fetch(`${base}/${name}.json5`);
				return res.ok ? res.text() : null;
			}),
		);
		const [light, dark, miLight] = files;
		if (light && dark && miLight) {
			return {
				tag,
				baseThemes: [light, dark],
				lightTheme: defaultLightTheme ?? miLight,
			};
		}
	}
	throw new Error(`Theme files not found for ${tags.join(', ')}`);
}

// 範囲外参照は実装誤り
function at<T>(list: ArrayLike<T>, index: number): T {
	const value = list[index];
	if (value === undefined) throw new Error(`Index out of range: ${index}`);
	return value;
}

function lcs<T>(
	a: T[],
	b: T[],
	eq: (x: T, y: T) => boolean,
): [number, number][] {
	const width = b.length + 1;
	const dp = new Uint32Array((a.length + 1) * width);
	const cell = (i: number, j: number) => at(dp, i * width + j);
	for (let i = a.length - 1; i >= 0; i--) {
		for (let j = b.length - 1; j >= 0; j--) {
			dp[i * width + j] = eq(at(a, i), at(b, j))
				? cell(i + 1, j + 1) + 1
				: Math.max(cell(i + 1, j), cell(i, j + 1));
		}
	}
	const pairs: [number, number][] = [];
	let i = 0;
	let j = 0;
	while (i < a.length && j < b.length) {
		if (eq(at(a, i), at(b, j))) pairs.push([i++, j++]);
		else if (cell(i + 1, j) >= cell(i, j + 1)) i++;
		else j++;
	}
	return pairs;
}

function rectDiff(a: Rect, b: Rect, tolerance = TOLERANCE): string[] {
	return (['x', 'y', 'w', 'h'] as const)
		.filter((k) => Math.abs(a[k] - b[k]) > tolerance)
		.map((k) => `${k}: ${a[k]} -> ${b[k]}`);
}

function styleDiff(
	a: Record<string, string>,
	b: Record<string, string>,
): string[] {
	// 同値のグラデーション表記を統一
	const normalize = (v: string | undefined) =>
		v?.replaceAll('gradient(to right,', 'gradient(90deg,');
	return Object.keys(a)
		.filter((k) => normalize(a[k]) !== normalize(b[k]))
		.map((k) => `${k}: ${a[k]} -> ${b[k]}`);
}

// keyと出現順で対応付け
function matchByKey<T extends { key: string }>(a: T[], b: T[]) {
	const occurrence = (list: T[]) => {
		const seen = new Map<string, number>();
		return list.map((item) => {
			const n = seen.get(item.key) ?? 0;
			seen.set(item.key, n + 1);
			return `${item.key}#${n}`;
		});
	};
	const indexB = new Map(occurrence(b).map((k, j) => [k, j]));
	const pairs: [T, T][] = [];
	const onlyA: T[] = [];
	occurrence(a).forEach((k, i) => {
		const j = indexB.get(k);
		if (j == null) {
			onlyA.push(at(a, i));
			return;
		}
		pairs.push([at(a, i), at(b, j)]);
		indexB.delete(k);
	});
	return { pairs, onlyA, onlyB: [...indexB.values()].map((j) => at(b, j)) };
}

function textReport(
	ref: Collected['chars'],
	own: Collected['chars'],
): string[] {
	const lines: string[] = [];
	let run: { text: string; diff: string } | null = null;
	const flush = () => {
		if (run?.diff) lines.push(`"${run.text}": ${run.diff}`);
		run = null;
	};
	const unmatched = (
		list: Collected['chars'],
		from: number,
		to: number,
		side: string,
	) => {
		if (to <= from) return;
		flush();
		lines.push(
			`only in ${side}: "${list
				.slice(from, to)
				.map((c) => c.ch)
				.join('')}"`,
		);
	};
	let pi = 0;
	let pj = 0;
	for (const [i, j] of lcs(ref, own, (x, y) => x.ch === y.ch)) {
		unmatched(ref, pi, i, 'Misskey');
		unmatched(own, pj, j, 'mfm-vue');
		const a = at(ref, i);
		const b = at(own, j);
		const diff = [...rectDiff(a, b), ...styleDiff(a.style, b.style)].join(', ');
		if (run && run.diff === diff) run.text += a.ch;
		else {
			flush();
			run = { text: a.ch, diff };
		}
		pi = i + 1;
		pj = j + 1;
	}
	unmatched(ref, pi, ref.length, 'Misskey');
	unmatched(own, pj, own.length, 'mfm-vue');
	flush();
	return lines;
}

function mediaReport(
	ref: Collected['media'],
	own: Collected['media'],
): string[] {
	const lines: string[] = [];
	for (let i = 0; i < Math.max(ref.length, own.length); i++) {
		const a = ref[i];
		const b = own[i];
		if (!a || !b) {
			const item = a ?? b;
			if (!item) continue;
			const side = a ? 'Misskey' : 'mfm-vue';
			lines.push(`#${i}: only in ${side} (${item.kind} ${item.src ?? ''})`);
			continue;
		}
		const diff = [
			...(a.kind !== b.kind ? [`kind: ${a.kind} -> ${b.kind}`] : []),
			...rectDiff(a, b, a.kind === 'icon' ? ICON_TOLERANCE : TOLERANCE),
			...(a.src !== b.src ? [`src: ${a.src} -> ${b.src}`] : []),
			...(a.alt !== b.alt ? [`alt: ${a.alt} -> ${b.alt}`] : []),
			...(a.area != null &&
			b.area != null &&
			Math.abs(a.area - b.area) > Math.max(a.area, b.area) * ICON_AREA_RATIO
				? [`ink area: ${a.area} -> ${b.area}`]
				: []),
		];
		if (diff.length) lines.push(`#${i} ${a.kind}: ${diff.join(', ')}`);
	}
	return lines;
}

function boxReport(ref: Collected['boxes'], own: Collected['boxes']): string[] {
	const { pairs, onlyA, onlyB } = matchByKey(ref, own);
	return [
		...onlyA.map((b) => `only in Misskey: "${b.key}"`),
		...onlyB.map((b) => `only in mfm-vue: "${b.key}"`),
		...pairs.flatMap(([a, b]) => {
			const diff = [
				...rectDiff(a, b),
				...(a.lines !== b.lines ? [`lines: ${a.lines} -> ${b.lines}`] : []),
				...styleDiff(a.style, b.style),
			];
			return diff.length ? [`"${a.key}": ${diff.join(', ')}`] : [];
		}),
	];
}

function controlReport(
	ref: Collected['controls'],
	own: Collected['controls'],
	refStates: StateStyles,
	ownStates: StateStyles,
): string[] {
	const { pairs, onlyA, onlyB } = matchByKey(ref, own);
	return [
		...onlyA.map((c) => `only in Misskey: ${c.key}`),
		...onlyB.map((c) => `only in mfm-vue: ${c.key}`),
		...pairs.flatMap(([a, b]) =>
			[
				['default', a.style, b.style] as const,
				...STATES.map(
					(s) =>
						[
							s,
							refStates[s]?.[a.id] ?? {},
							ownStates[s]?.[b.id] ?? {},
						] as const,
				),
			].flatMap(([state, x, y]) => {
				const diff = styleDiff(x, y);
				return diff.length ? [`${a.key} (${state}): ${diff.join(', ')}`] : [];
			}),
		),
	];
}

async function main() {
	const args = process.argv.slice(2);
	const noteUrl = args.find((a) => !a.startsWith('--')) ?? '';
	const width = Number(
		args.find((a) => a.startsWith('--width='))?.slice(8) ?? 1280,
	);
	const evalExpr = args.find((a) => a.startsWith('--eval='))?.slice(7);
	const match = noteUrl.match(/^(https:\/\/[^/]+)\/notes\/([A-Za-z0-9]+)/);
	if (!match) {
		console.error('usage: pnpm compare <https://host/notes/id> [--width=<px>]');
		process.exit(2);
	}
	const [, origin, noteId] = match as unknown as [string, string, string];

	const [note, meta, emojiList] = await Promise.all([
		postJson<Note>(`${origin}/api/notes/show`, { noteId }),
		postJson<{
			version: string;
			mediaProxy: string;
			defaultLightTheme: string | null;
		}>(`${origin}/api/meta`, { detail: false }),
		postJson<{ emojis: { name: string; url: string }[] }>(
			`${origin}/api/emojis`,
			{},
		),
	]);
	if (!note.text) throw new Error('Note has no text');
	if (note.cw != null) throw new Error('Notes with CW are not supported');
	const themes = await fetchThemes(meta.version, meta.defaultLightTheme);
	console.log(`Misskey ${meta.version}, themes from tag ${themes.tag}`);

	const server = await createServer({
		configFile: false,
		root: here('.'),
		cacheDir: here('../../node_modules/.vite-compare'),
		logLevel: 'error',
		plugins: [vue()],
		resolve: {
			alias: {
				'aiscript-grammar': here(
					'../../vendor/aiscript-vscode/aiscript/syntaxes/aiscript.tmLanguage.json',
				),
			},
		},
		server: { host: '127.0.0.1', port: 0 },
	});
	await server.listen();
	const address = server.httpServer?.address();
	if (!address || typeof address === 'string') throw new Error('Failed to start Vite');
	const { port } = address;
	const chrome = await launchChrome();

	try {
		const refPage = await openPage(chrome.cdp, noteUrl, width);
		// 本家のMfmルートはwhite-space: pre-wrapのspan, 本文と3文字単位の一致数で選択
		const refRootExpr = `(() => {
			const grams = (t) => {
				const s = t.replace(/\\s+/g, "");
				return new Set(Array.from({ length: Math.max(s.length - 2, 0) }, (_, i) => s.slice(i, i + 3)));
			};
			const target = grams(${JSON.stringify(note.text)});
			let best = null;
			let bestScore = 0;
			for (const span of document.querySelectorAll('span[style*="pre-wrap"]')) {
				const g = grams(span.textContent);
				const hit = [...g].filter((x) => target.has(x)).length;
				const score = hit * 2 - g.size;
				if (score > bestScore) [best, bestScore] = [span, score];
			}
			return best;
		})()`;
		const ref = await collectStable(refPage, refRootExpr);
		const env = await refPage.evaluate<{
			lang: string;
			container: Record<string, string>;
			rootStyle: Record<string, string>;
			vars: Record<string, string>;
		}>(`(() => {
			const parent = (${refRootExpr}).parentElement;
			const s = getComputedStyle(parent);
			const html = getComputedStyle(document.documentElement);
			const vars = {};
			for (const name of html) {
				if (name.startsWith("--MI_THEME-")) vars[name.slice(11)] = html.getPropertyValue(name).trim();
			}
			const props = ["font-family", "font-size", "font-weight", "letter-spacing", "word-break", "color"];
			const width = parent.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
			return {
				lang: document.documentElement.lang,
				container: {
					...Object.fromEntries(props.map((p) => [p.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), s.getPropertyValue(p)])),
					width: width + "px",
					// 本家のhtmlは単位なしのline-height
					lineHeight: String(Math.round((parseFloat(s.lineHeight) / parseFloat(s.fontSize)) * 1e4) / 1e4),
				},
				rootStyle: { userSelect: getComputedStyle(${refRootExpr}).userSelect },
				vars,
			};
		})()`);
		const refStates = await stateStyles(refPage, ref);

		const config = {
			text: note.text,
			options: {
				instanceUrl: origin,
				author: { host: note.user.host, isCat: note.user.isCat ?? false },
				emojiUrls: note.emojis ?? null,
				customEmojis: Object.fromEntries(
					emojiList.emojis.map((emoji) => [emoji.name, emoji.url]),
				),
				locale: env.lang || 'ja-JP',
				nyaize: 'respect',
				mediaProxy: meta.mediaProxy,
				colorScheme: 'light',
				lightTheme: themes.lightTheme,
				baseThemes: themes.baseThemes,
			},
			container: env.container,
			rootStyle: env.rootStyle,
		};
		const ownPage = await openPage(
			chrome.cdp,
			`http://127.0.0.1:${port}/`,
			width,
			`window.__MFM_COMPARE__ = ${JSON.stringify(config)};`,
		);
		const ownRootExpr = 'document.querySelector("#app > span.mfm")';
		const own = await collectStable(ownPage, ownRootExpr);
		const ownVars = await ownPage.evaluate<Record<string, string>>(`(() => {
			const s = getComputedStyle(${ownRootExpr});
			const vars = {};
			for (const name of s) {
				if (name.startsWith("--mfm-theme-")) vars[name.slice(12)] = s.getPropertyValue(name).trim();
			}
			return vars;
		})()`);
		const ownStates = await stateStyles(ownPage, own);

		if (evalExpr) {
			for (const [name, page, expr] of [
				['Misskey', refPage, refRootExpr],
				['mfm-vue', ownPage, ownRootExpr],
			] as const) {
				const value = await page.evaluate(`((root) => ${evalExpr})(${expr})`);
				console.log(`## ${name}\n${JSON.stringify(value, null, 1)}`);
			}
			return;
		}

		const sections: [string, string[]][] = [
			[
				'theme variables',
				[...new Set([...Object.keys(env.vars), ...Object.keys(ownVars)])]
					.filter((k) => env.vars[k] !== ownVars[k])
					.map(
						(k) =>
							`${k}: ${env.vars[k] ?? '(none)'} -> ${ownVars[k] ?? '(none)'}`,
					),
			],
			[
				'root',
				ref.root && own.root
					? [
						...rectDiff(ref.root, own.root),
						...(Math.abs(ref.root.bottom - own.root.bottom) > TOLERANCE
							? [`bottom: ${ref.root.bottom} -> ${own.root.bottom}`]
							: []),
					]
					: [],
			],
			['text', textReport(ref.chars, own.chars)],
			['images and icons', mediaReport(ref.media, own.media)],
			['decorated elements', boxReport(ref.boxes, own.boxes)],
			[
				'controls',
				controlReport(ref.controls, own.controls, refStates, ownStates),
			],
		];
		console.log(
			`chars ${ref.chars.length}/${own.chars.length}, images and icons ${ref.media.length}/${own.media.length}, decorated ${ref.boxes.length}/${own.boxes.length}, controls ${ref.controls.length}/${own.controls.length} (Misskey/mfm-vue)`,
		);
		const diffs = sections.filter(([, lines]) => lines.length);
		for (const [title, lines] of diffs) {
			console.log(`## ${title}\n${lines.map((l) => `  ${l}`).join('\n')}`);
		}
		if (diffs.length === 0) console.log('No differences');
		else process.exitCode = 1;
	} finally {
		await chrome.shutdown();
		await server.close();
	}
}

await main();

import { en } from './en.js';
import { ja } from './ja.js';
import { others } from './others.js';
import type {
	MfmMessages,
	MfmMessagesInput,
	MfmRelativeTimeUnit,
} from '../types/index.js';

export const builtinMessages: Readonly<Record<string, MfmMessages>> = {
	en,
	ja,
	...others,
};

// 完全一致, 未対応en
export function resolveMessages(
	locale: string,
	input: MfmMessagesInput | undefined,
): MfmMessages {
	const key = locale.toLowerCase();
	const base =
		builtinMessages[key] ?? builtinMessages[key.split('-')[0] ?? ''] ?? en;
	if (!input) return base;
	return {
		...base,
		...input,
		ago: { ...base.ago, ...input.ago },
		timeIn: { ...base.timeIn, ...input.timeIn },
	};
}

// 時以上は四捨五入, 分以下は切り捨て
const UNITS: [MfmRelativeTimeUnit, number, (n: number) => number][] = [
	['years', 31536000, Math.round],
	['months', 2592000, Math.round],
	['weeks', 604800, Math.round],
	['days', 86400, Math.round],
	['hours', 3600, Math.round],
	['minutes', 60, Math.trunc],
];

// agoは経過秒数, 負数は未来
export function formatRelativeTime(
	ago: number,
	messages: MfmMessages,
	locale = 'en-US',
): string {
	const rtf = () => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	if (ago >= -3 && ago < 10) {
		return messages.justNow ?? rtf().format(0, 'second');
	}
	const abs = Math.abs(ago);
	const unit = UNITS.find(([, sec]) => abs >= sec);
	const [name, n]: [MfmRelativeTimeUnit, number] = unit
		? [unit[0], unit[2](abs / unit[1])]
		: ['seconds', Math.trunc(abs)];
	const template = (ago > 0 ? messages.ago : messages.timeIn)?.[name];
	if (template) return template.replace('{n}', String(n));
	return rtf().format(ago > 0 ? -n : n, name);
}

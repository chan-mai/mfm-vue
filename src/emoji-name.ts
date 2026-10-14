let names: Promise<Map<string, string>> | null = null;

// 初回ホバー時に絵文字一覧を読み込み
function load() {
	names ??= import('@misskey-dev/emoji-data/emojilist.json', {
		with: { type: 'json' },
	}).then(
		({ default: list }) => new Map(list.map(([char, name]) => [char, name])),
	);
	return names;
}

// 1コードポイントの絵文字へU+FE0F付与
export function colorizeEmoji(char: string): string {
	return Array.from(char).length === 1 ? `${char}️` : char;
}

export async function getEmojiName(char: string): Promise<string> {
	const map = await load();
	return map.get(colorizeEmoji(char)) ?? map.get(char) ?? char;
}

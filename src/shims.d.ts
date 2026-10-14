declare module 'aiscript-grammar' {
	const grammar: Record<string, unknown>;
	export default grammar;
}

declare module 'punycode.js' {
	const punycode: { toUnicode(input: string): string };
	export default punycode;
}

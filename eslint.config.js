import pluginMisskey from '@misskey-dev/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import vueParser from 'vue-eslint-parser';

// 概ね@misskey-dev/eslint-plugin準拠
export default [
	{
		ignores: [
			'dist/**',
			'dist-demo/**',
			'node_modules/**',
			'vendor/**',
			// ページ内で評価する式
			'scripts/compare/collect.js',
		],
	},
	...pluginMisskey.configs.recommended,
	{
		files: ['**/*.vue'],
		...pluginMisskey.configs.typescript,
	},
	...pluginVue.configs['flat/recommended'],
	{
		files: ['**/*.{js,mjs,ts,vue}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parser: vueParser,
			parserOptions: {
				extraFileExtensions: ['.vue'],
				parser: tsParser,
				projectService: {
					allowDefaultProject: ['eslint.config.js', 'scripts/check-dist.mjs'],
				},
				sourceType: 'module',
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// 未定義参照は型検査で検出
			'no-undef': 'off',
			'@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
			'@typescript-eslint/no-unused-expressions': 'off',
			'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
			'id-denylist': [
				'warn',
				'window',
				'e',
				'close',
				'open',
				'fetch',
				'location',
				'document',
				'history',
				'scroll',
				'setTimeout',
				'setInterval',
				'clearTimeout',
				'clearInterval',
			],
			'no-shadow': ['warn'],
			'vue/block-order': ['error', { order: [['script:not([setup])', 'script[setup]'], 'template', 'style'] }],
			'vue/attributes-order': ['error', { alphabetical: false }],
			'vue/no-use-v-if-with-v-for': [
				'error',
				{ allowUsingIterationVar: false },
			],
			'vue/no-ref-as-operand': 'error',
			'vue/no-multi-spaces': ['error', { ignoreProperties: false }],
			'vue/no-v-html': 'warn',
			'vue/order-in-components': 'error',
			'vue/html-indent': [
				'warn',
				'tab',
				{
					attribute: 1,
					baseIndent: 0,
					closeBracket: 0,
					alignAttributesVertically: true,
					ignores: [],
				},
			],
			'vue/html-closing-bracket-spacing': [
				'warn',
				{ startTag: 'never', endTag: 'never', selfClosingTag: 'never' },
			],
			'vue/multi-word-component-names': 'warn',
			'vue/require-v-for-key': 'warn',
			'vue/no-unused-components': 'warn',
			'vue/no-unused-vars': 'warn',
			'vue/no-dupe-keys': 'warn',
			'vue/valid-v-for': 'warn',
			'vue/return-in-computed-property': 'warn',
			'vue/no-setup-props-reactivity-loss': 'warn',
			'vue/max-attributes-per-line': 'off',
			'vue/html-self-closing': [
				'error',
				{
					html: { void: 'any', normal: 'never', component: 'any' },
					svg: 'any',
					math: 'any',
				},
			],
			'vue/singleline-html-element-content-newline': 'off',
			'vue/v-on-event-hyphenation': ['error', 'never', { autofix: true }],
			'vue/attribute-hyphenation': ['error', 'never'],
			'vue/no-mutating-props': ['error', { shallowOnly: true }],
		},
	},
	{
		// Vite, Vitestの設定, SFC, モジュール宣言はdefault export必須
		files: ['eslint.config.js', '*.config.ts', '**/*.vue', '**/*.d.ts'],
		rules: {
			'import/no-default-export': 'off',
		},
	},
	{
		// 構文名と同名の描画部品
		files: ['src/components/**/*.vue'],
		rules: {
			'vue/multi-word-component-names': 'off',
		},
	},
	{
		// テスト用のインライン部品
		files: ['test/**/*.ts'],
		rules: {
			'vue/one-component-per-file': 'off',
		},
	},
];

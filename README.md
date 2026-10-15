# mfm-vue

[![npm](https://img.shields.io/npm/v/mfm-vue?style=flat-square&logo=npm&logoColor=white&label=npm&color=86b300)](https://www.npmjs.com/package/mfm-vue)
[![CI](https://img.shields.io/github/actions/workflow/status/chan-mai/mfm-vue/ci.yaml?branch=develop&style=flat-square&logo=github&logoColor=white&label=CI&color=86b300)](https://github.com/chan-mai/mfm-vue/actions/workflows/ci.yaml)
[![License](https://img.shields.io/npm/l/mfm-vue?style=flat-square&label=license&color=86b300)](./LICENSE)
[![Demo](https://img.shields.io/badge/demo-mfm--vue--demo.mq1.dev-86b300?style=flat-square&logo=cloudflareworkers&logoColor=white)](https://mfm-vue-demo.mq1.dev/)

![Vue](https://img.shields.io/badge/Vue_3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Misskey](https://img.shields.io/badge/Misskey-86B300?style=flat-square&logo=misskey&logoColor=white)

Vue 3向けの[MFM](https://misskey-hub.net/ja/docs/for-users/features/mfm/)レンダラです。構文解析には[mfm.js](https://github.com/misskey-dev/mfm.js)を利用しています。他実装とは異なり、Misskey本家との描画結果の互換性を重視しています。

## 特徴

- `<Mfm>`を通常のVueコンポーネントとしてimportして利用できます。`app.use()`やグローバル登録は不要です
- リンク, メンション, ハッシュタグ, 絵文字, コード, 数式などの描画を、コンポーネントまたはslotで差し替えることができます
- 独自関数の追加や組み込み関数の上書き・無効化をサポートしています
- AST変換は描画関数で行い構文ノードごとのコンポーネント生成を行っていません。リンク/絵文字等の描画部品はSFCで、SSRとハイドレーションに対応しています
- 各スタイルはすべてコンポーネント単位のscoped CSSで構成されており、グローバルセレクタやキーフレームで汚染することは(おそらく)ありません
- `v-html`/`innerHTML`未使用

## インストール

```sh
pnpm add mfm-vue mfm-js vue
```

ビルド済みパッケージから利用する場合は、スタイルシートを一度だけ読み込む必要があります。(*中身は各コンポーネントのscoped CSSで、セレクタはすべてscope属性付きデす)

```ts
import "mfm-vue/style.css";
```

## 使い方

### 基本

```vue
<script setup lang="ts">
import { Mfm } from "mfm-vue";

const note = {
  text: "Hello **MFM** :misskey: $[tada 🎉] @ai #misskey",
  emojis: {},
  user: { host: null, isCat: false },
};
</script>

<template>
  <Mfm
    :text="note.text"
    instance-url="https://misskey.example"
    :author="note.user"
    :emoji-urls="note.emojis"
    nyaize="respect"
    @click-ev="(ev) => console.log(ev)"
  />
</template>
```

### 主要props

| props | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `text` | `string` | `""` | MFM文字列 |
| `nodes` | `MfmNode[] \| null` | `null` | 解析済みAST(指定時は`text`を解析しません) |
| `plain` | `boolean` | `false` | 絵文字とテキストのみ解析し改行を空白へ変換します |
| `nowrap` | `boolean` | `false` | 改行を行わず、はみ出した部分を省略表示します |
| `nestLimit` | `number` | mfm.jsの既定値 | 入れ子の上限 |
| `instanceUrl` | `string` | なし | テキスト取得元サーバのURL(リンク生成, ホスト判定, アバター画像と絵文字画像のURL生成に使用され、未指定時には相対パスにフォールバックされます) |
| `author` | `{ host?: string \| null; isCat?: boolean }` | `null` | 投稿者(`host`は取得元サーバ所属のとき`null`としてください) |
| `emojiUrls` | `Record<string, string>` | `null` | ノートの`emojis`フィールド相当 |
| `customEmojis` | `Record<string, string> \| (name, host) => string \| null` | `null` | カスタム絵文字URLの解決 |
| `emojiStyle` | `"twemoji" \| "fluentEmoji" \| "native"` | `"twemoji"` | Unicode絵文字の表示。Misskeyの絵文字スタイル設定相当です |
| `unicodeEmojiUrl` | `(emoji) => string \| null` \| `null` | なし | Unicode絵文字の画像URL(`emojiStyle`より優先され`null`時あテキストのまま表示されます) |
| `advanced` | `boolean` | `true` | Misskeyの「高度なMFM」設定相当 |
| `animated` | `boolean \| "auto"` | `"auto"` | Misskeyの「MFMアニメーション」設定相当。`"auto"`指定時はクライアントの`prefers-reduced-motion`準拠し、`true`は常に再生、`false`は停止します |
| `isNote` | `boolean` | `true` | `false`でハッシュタグのリンク先が`/user-tags/`になります |
| `nyaize` | `boolean \| "respect"` | `false` | `"respect"`は`author.isCat`が`true`の場合のみ変換します |
| `rootScale` | `number` | `1` | 拡大率の初期値 |
| `components` | `Partial<MfmComponents>` | なし | 描画コンポーネントの差し替え |
| `fns` | `Record<string, MfmFnHandler \| false>` | なし | 関数構文ハンドラの追加・上書き・無効化 |
| `locale` | `string` | `"en-US"` | 文言と日時書式の言語(BCP 47) |
| `messages` | `MfmMessagesInput` | なし | 文言の部分上書き |
| `highlight` | `boolean \| { defaultLang?: string }` | `true` | コードブロックのshikiによる色分け。`false`で無効化。配色はテーマの`codeHighlighter`で指定してください |
| `colorScheme` | `"light" \| "dark" \| "auto"` | `"light"` | ライト・ダークテーマ選択 |
| `lightTheme` / `darkTheme` | `MfmTheme \| string \| null` | なし | テーマ。Misskeyのテーマ定義のオブジェクト、またはテーマコードを指定します。 |
| `baseThemes` | `(MfmTheme \| string)[]` | なし | Misskeyデフォルトテーマ(Misskeyの`_light.json5`, `_dark.json5`相当) |
| `userPreview` | `({ username, host }) => Promise<MfmUserPreview \| null>` \| `null` | `null` | 指定時のみメンションにホバーしてユーザ情報を表示するようになります |
| `dataSaver` | `{ avatar?, urlPreviewThumbnail?, code? }` | すべて`false` | Misskey データセーバー相当 |
| `me` | `{ username: string; host?: string \| null } \| null` | `null` | 閲覧者。指定時のみ本人へのメンションをテーマの`mentionMe`の色(Mi Lightでは`rgb(0, 179, 70)`)で表示します。`host`は取得元サーバ所属のとき`null`である必要があります |
| `urlPreview` | `(url) => Promise<MfmUrlPreview \| null>` \| `null` | `null` | 指定時のみURLとリンクにホバーしてプレビューを表示するようになります |
| `navigate` | `(path, event) => void` \| `null` | `null` | 取得元サーバ内へのリンク(メンション, ハッシュタグ, 同一オリジンのURL)のクリック時に、ブラウザの遷移の代わりに実行します |
| `paths` | `{ user?(acct): string; hashtag?(tag, isNote): string }` | `/@user@host`, `/tags/tag` | メンション, ハッシュタグのリンク先パス |
| `searchEngine` | `string` | `"https://www.google.com/search?q={query}"` | 検索構文の検索先 |
| `mediaProxy` | `string \| null` | `null` | メディアプロキシ |
| `disableAnimatedImages` | `boolean` | `false` | `mediaProxy`経由で絵文字とアバターを静止画で表示します |

`<Mfm>`は次のイベントを送出します。

- `clickEv(ev: string)`: `$[clickable.ev=xxx ...]`のクリック時
- `copy({ text, success })`: コードブロックのコピー時(`provideMfmConfig`では`onCopy`でも取得できます)

### i18n

`locale`の完全一致(`zh-tw`など), 言語部分(`ja-JP`なら`ja`)で指定可能です。`en`, `ja`等はMisskeyの表記に準拠しています。そのほか`zh`, `zh-TW`, `ko`, `fr`, `de`, `es`, `it`, `pt`, `ru`, `uk`, `pl`, `tr`, `id`, `th`, `vi`, `ar`を同梱しています。これらの言語の相対時刻は`Intl.RelativeTimeFormat`で表示されますが、サポートされていない言語は`en`の文言にフォールバックされるため、必要に応じて`messages`をoverrideしてください。

```ts
provideMfmConfig({
  locale: "fr-FR",
  messages: { search: "Rechercher", ago: { years: "il y a {n} ans" } },
});
```


### コードハイライト

shikiは初回のコードブロック描画時にdynamic importで読み込まれます。SSRとハイドレーションエラーを回避する目的で、`onMounted`発火後にハイライトされます。ライト・ダーク両テーマの色をCSS変数で出力するため、`colorScheme: "auto"`を明示した場合においてもOSの設定変更が反映されます。

AiScriptの構文定義は[aiscript-vscode](https://github.com/aiscript-dev/aiscript-vscode)(MIT, v0.1.16)に準拠しています。

### テーマ

テーマに関連する全ての処理はMisskeyと互換のため、テーマコードがそのまま利用可能です。

MisskeyのテーマデータはAGPL-3.0のため同梱していません。必要に応じて利用側で用意していい感じに指定してください。

```ts
provideMfmConfig({
  colorScheme: "auto",
  // Misskeyのpackages/frontend-shared/themes/_light.json5, _dark.json5
  baseThemes: [lightBaseCode, darkBaseCode],
  // テーマコード(JSON5文字列)またはオブジェクト
  lightTheme: miLightCode,
  darkTheme: myDarkThemeCode,
});
```

1. 文字列はJSON5として解析しており、`id`, `name`, `base`を検証します
2. テーマの`base`と同じ`id`のデフォルトテーマがあれば、その全項目の上にテーマの`props`を重ねる挙動をします
3. `props`の各値を解決します。`@参照`, `$定数`, `:darken<n<色` `:lighten<n<色` `:alpha<n<色` `:hue<n<色` `:saturate<n<色`, `"`で開始される値に対応しています。
4. `id: "light"`のデフォルトテーマがあれば、その項目から`X`始まりを除いたもの(Misskeyの`themeProps`)に含まれる項目のみを出力します(デフォルトテーマが存在しない場合は、解決した全項目を出力します)
5. 各項目を`--mfm-theme-<項目名>`のCSS変数としてルート要素とポップアップに出力します(Misskeyの`--MI_THEME-<項目名>`に相当)。Misskeyの`html`要素と同じく、`color: var(--mfm-theme-fg)`と、`base`に応じた`color-scheme`を設定します
6. コードハイライトのテーマは、デフォルトテーマの`codeHighlighter`と合成します。`base: "_none_"`は`overrides`をそのままshikiのテーマとし、それ以外は同梱テーマへ`overrides`をdeepMergeします。(`codeHighlighter`がない場合は`dark-plus`です)

`colorScheme: "auto"`は、Misskeyの「デバイスのダークモードと同期」に相当します。
利用側の文字色を継承したい場合は、テーマで`fg: '"inherit'`を指定してください。

本家(Misskey 2026.10.系, Mi Light)の`html`要素に設定された62項目の`--MI_THEME-*`と、同バージョンのテーマファイルから本ライブラリが出力した`--mfm-theme-*`が全項目一致することを確認しています。

### ユーザプレビュー

`createUserPreviewFetcher(endpoint)`は、Misskeyの`POST /api/users/show`の応答を変換する取得関数を作成ます。フォロー数・フォロワー数は、公開範囲が`public`の場合のみ表示され、名前と自己紹介はMFMとして解釈・描画されます。フォロー等、一切の操作を含みません。

```ts
provideMfmConfig({
  userPreview: createUserPreviewFetcher("https://misskey.example/api/users/show"),
});
```

独自実装のコンポーネントから設定を参照する場合は`useMfmContext()`が利用可能です。

### URLプレビュー

取得処理は`urlPreview`に指定した関数で行います。`createUrlPreviewFetcher(endpoint, { lang })`は、Misskeyの`/url`エンドポイント(summaly)互換の応答を変換する取得関数を作成します。(一般に、)Misskeyの`/url`はCORSヘッダをレスポンスに含めないため、ブラウザから別オリジンのサーバを直接参照することはできません。同一オリジンで動かすかいい感じのサーバで中継してください(デモの開発サーバは中継しています)

```ts
provideMfmConfig({
  urlPreview: createUrlPreviewFetcher("/api/url-preview", { lang: "ja-JP" }),
});
```

### サイト内遷移

```ts
const router = useRouter();
provideMfmConfig({
  instanceUrl: "https://misskey.example",
  navigate: (path) => router.push(path),
  paths: { user: (acct) => `/users/${acct}` },
});
```

リンクの`href`は常に実際のURLです

### 設定の共有(`provideMfmConfig`)

親コンポーネントの`setup`で実行すると、子孫の`<Mfm>`へ設定が共有されます。refやgetterを指定するとリアクティブに反映されます。入れ子で実行した場合は親の設定とマージされ、`<Mfm>`のpropsが最優先です。

```ts
import { provideMfmConfig, createInstanceEmojiResolver } from "mfm-vue";

provideMfmConfig(() => ({
  instanceUrl: "https://misskey.example",
  customEmojis: createInstanceEmojiResolver("https://misskey.example"),
  animated: !prefersReducedMotion.value,
}));
```

`app.provide(mfmConfigKey, () => config)`で全体へ適用することも可能です。

### 描画の差し替え

コンポーネントで差し替える際には、`components`にpropsの一部だけを宣言したコンポーネントを指定することができます。

```vue
<script setup lang="ts">
import { Mfm } from "mfm-vue";
import RouterMention from "./RouterMention.vue"; // props: MfmMentionProps
import ShikiCode from "./ShikiCode.vue"; // props: MfmBlockCodeProps
</script>

<template>
  <Mfm :text="text" :components="{ mention: RouterMention, blockCode: ShikiCode }" />
</template>
```

子要素のない構文は、slotでも差し替え可能です。

```vue
<Mfm :text="text">
  <template #hashtag="{ hashtag, href }">
    <RouterLink :to="href">#{{ hashtag }}</RouterLink>
  </template>
  <template #unicodeEmoji="{ emoji }">
    <TwemojiImage :emoji="emoji" />
  </template>
</Mfm>
```

| 名前 | props | slot |
| --- | --- | --- |
| `url` | `url, rel, external` | 可 |
| `link` | `url, rel, external, silent` + default slot | 不可 |
| `mention` | `username, host, isSourceHost, acct, href, avatarUrl, isMe` | 可 |
| `hashtag` | `hashtag, href` | 可 |
| `customEmoji` | `name, host, isSourceHost, url, normal, useOriginalSize` | 可 |
| `unicodeEmoji` | `emoji, url` | 可 |
| `inlineCode` | `code` | 可 |
| `blockCode` | `code, lang` | 可 |
| `mathInline` / `mathBlock` | `formula` | 可 |
| `search` | `query, content` | 可 |
| `unixtime` | `time`(ミリ秒) | 可 |
| `sparkle` | default slot | 不可 |

メンションとカスタム絵文字の`host`は確定済みのホスト名である必要があります。`instanceUrl`を明示した場合、取得元サーバ所属の場合も実際のホスト名が参照され、`isSourceHost`が`true`になります。

### 関数構文の拡張

```ts
import { h } from "vue";
import type { MfmFnHandler } from "mfm-vue";

const highlight: MfmFnHandler = (ctx) =>
  h("mark", { class: "my-highlight" }, ctx.renderChildren());

// <Mfm :fns="{ highlight, blur: false }" />
```

ハンドラの戻り値が`null`の場合は、未知の関数として`$[name ...]`のまま表示します。`ctx`には`args`, `scale`, `renderChildren(scale?)`, `renderNodes(nodes)`, `transformText(text)`, `renderComponent(name, props)`, `emitClick(ev)`があります。

### 外部データの取得

本ライブラリに外部APIへのアクセス処理はありません。絵文字一覧などは利用側で取得し、オプションに指定する必要があります。

```ts
const emojis = shallowRef<Record<string, string>>({});
const res = await fetch("https://misskey.example/api/emojis");
const json = await res.json();
emojis.value = Object.fromEntries(json.emojis.map((e) => [e.name, e.url]));

provideMfmConfig(() => ({ customEmojis: emojis.value }));
```

### 絵文字URLの解決順序

1. `emojiUrls[name]`
2. 投稿者がリモートかつ`emojiUrls`が指定されている場合、`:name:`の文字列表示
3. `customEmojis`が関数の場合`customEmojis(name, host)`(`host`は取得元サーバの絵文字であれば`null`)
4. `customEmojis`がオブジェクトの場合、取得元サーバの絵文字に限り`customEmojis[name]`
5. いずれもなければ`url: null`(既定コンポーネントではテキスト表示)

### SSR

`renderToString`で描画できます。DOM APIに依存する処理(sparkleのパーティクル, unixtimeのローカル時刻表示)は`onMounted`以降に実行します。また、ハイドレーション時の不一致防止のため、unixtimeは`onMounted`発火までUTC表記で出力します。

### スタイル

スタイルはコンポーネント単位のscoped CSSです。`$[...]`などのASTから生成される要素は、`<Mfm>`の描画中に生成するため`<Mfm>`のscope属性が付与されます。アニメーションはクラスで指定し、`speed`, `delay`引数はインラインの`animation-duration`, `animation-delay`で上書きしています。


### 描画関数からの利用

`renderMfmNodes`はASTをVNodeの配列へ変換します。`<Mfm>`の外で実行した場合、書式や`$[...]`用のscoped CSSは適用されません。

```ts
import { renderMfmNodes, resolveMfmOptions } from "mfm-vue";
import * as mfm from "mfm-js";

const children = renderMfmNodes(mfm.parse(text), {
  options: resolveMfmOptions({ instanceUrl: "https://misskey.example" }),
  plain: false,
  nowrap: false,
  slots: {},
  emitClick: () => {},
});
```

## 対応状況

### 対応表

mfm.js 0.27.0の全構文と、Misskey本家が描画する全関数(24種類)に対応しています。

#### 構文

| 構文 | 記法の例 | 対応内容 | 実装 | テスト |
| --- | --- | --- | --- | --- |
| text | 本文 | 改行の`<br>`変換, nyaize | `render/nodes/text.ts` | `test/syntax/format.test.ts` |
| plain | `<plain>**a**</plain>` | 内側の構文を解析しない | `render/nodes/text.ts` | `test/syntax/format.test.ts` |
| bold | `**太字**` | | `render/nodes/format.ts` | `test/syntax/format.test.ts` |
| italic | `<i>斜体</i>` | | `render/nodes/format.ts` | `test/syntax/format.test.ts` |
| strike | `~~打ち消し~~` | | `render/nodes/format.ts` | `test/syntax/format.test.ts` |
| small | `<small>小さい</small>` | | `render/nodes/format.ts` | `test/syntax/format.test.ts` |
| center | `<center>中央</center>` | | `render/nodes/format.ts` | `test/syntax/format.test.ts` |
| quote | `> 引用` | nowrap時は`span`で描画 | `render/nodes/format.ts` | `test/syntax/format.test.ts` |
| url | `https://example.com` | `http:`, `https:`のみリンク化, punycode表示, URLプレビュー, サイト内遷移 | `render/nodes/link.ts`, `defaults/Url.vue` | `test/syntax/link.test.ts` |
| link | `[表示](https://example.com)` | 子要素のMFM描画, URLプレビュー, サイト内遷移 | `render/nodes/link.ts`, `defaults/Link.vue` | `test/syntax/link.test.ts` |
| mention | `@user@host` | ホストの補完, アバター, 本人の色分け, ユーザプレビュー, リンク先パスの変更 | `render/nodes/link.ts`, `defaults/Mention.vue` | `test/syntax/mention.test.ts` |
| hashtag | `#tag` | `isNote`による`/tags`, `/user-tags`の切り替え, リンク先パスの変更 | `render/nodes/link.ts`, `defaults/Hashtag.vue` | `test/syntax/hashtag.test.ts` |
| emojiCode | `:name:` | `emojiUrls`, `customEmojis`, 拡大中の原寸表示, ホバー時の拡大, メディアプロキシ, 静止画化 | `render/nodes/emoji.ts`, `defaults/CustomEmoji.vue` | `test/syntax/emoji.test.ts` |
| unicodeEmoji | 👍 | Twemoji, Fluent Emoji, 文字表示の切り替え, ホバー時の絵文字名 | `render/nodes/emoji.ts`, `defaults/UnicodeEmoji.vue` | `test/syntax/emoji.test.ts` |
| inlineCode | `` `code` `` | | `render/nodes/code.ts`, `defaults/InlineCode.vue` | `test/syntax/code.test.ts` |
| blockCode | ` ```js ` | shikiによる色分け, AiScript, ライト・ダーク, コピー, データセーバー | `render/nodes/code.ts`, `defaults/BlockCode.vue` | `test/syntax/code.test.ts` |
| mathInline | `\(x^2\)` | 本家と同じく`<code>`表示 | `render/nodes/code.ts`, `defaults/MathInline.vue` | `test/syntax/code.test.ts` |
| mathBlock | `\[x^2\]` | 本家と同じく`<code>`表示 | `render/nodes/code.ts`, `defaults/MathBlock.vue` | `test/syntax/code.test.ts` |
| search | `misskey 検索` | 検索先の指定 | `render/nodes/search.ts`, `defaults/Search.vue` | `test/syntax/search.test.ts` |
| fn | `$[name.arg 内容]` | 下記の関数を実行, 未知の関数は元の記法で表示 | `render/nodes/fn.ts` | `test/fns/special.test.ts` |

#### 関数: 色・スタイル

| 関数 | 引数 | 実装 | テスト |
| --- | --- | --- | --- |
| fg | `color` | `fns/style.ts` | `test/fns/style.test.ts` |
| bg | `color` | `fns/style.ts` | `test/fns/style.test.ts` |
| blur | | `fns/style.ts` | |
| font | `serif`, `monospace`, `cursive`, `fantasy`, `emoji`, `math` | `fns/style.ts` | `test/fns/style.test.ts` |
| border | `style`, `width`, `radius`, `color`, `noclip` | `fns/style.ts` | `test/fns/style.test.ts` |

#### 関数: 変形

| 関数 | 引数 | 実装 | テスト |
| --- | --- | --- | --- |
| rotate | `deg` | `fns/transform.ts` | `test/fns/transform.test.ts` |
| scale | `x`, `y`(最大5倍) | `fns/transform.ts` | `test/fns/transform.test.ts` |
| position | `x`, `y` | `fns/transform.ts` | `test/fns/transform.test.ts` |
| flip | `h`, `v` | `fns/transform.ts` | `test/fns/transform.test.ts` |
| x2, x3, x4 | | `fns/transform.ts` | `test/fns/transform.test.ts` |

#### 関数: アニメーション

| 関数 | 引数 | 実装 | テスト |
| --- | --- | --- | --- |
| spin | `speed`, `delay`, `x`, `y`, `left`, `alternate` | `fns/animation.ts` | `test/fns/animation.test.ts` |
| jump | `speed`, `delay` | `fns/animation.ts` | `test/fns/animation.test.ts` |
| bounce | `speed`, `delay` | `fns/animation.ts` | |
| shake | `speed`, `delay` | `fns/animation.ts` | `test/fns/animation.test.ts` |
| twitch | `speed`, `delay` | `fns/animation.ts` | |
| tada | `speed`, `delay` | `fns/animation.ts` | `test/fns/animation.test.ts` |
| jelly | `speed`, `delay` | `fns/animation.ts` | |
| rainbow | `speed`, `delay` | `fns/animation.ts` | |
| sparkle | | `fns/animation.ts`, `defaults/Sparkle.vue` | `test/fns/animation.test.ts` |

#### 関数: その他

| 関数 | 引数 | 実装 | テスト |
| --- | --- | --- | --- |
| ruby | | `fns/special.ts` | `test/fns/special.test.ts` |
| unixtime | | `fns/special.ts`, `defaults/Unixtime.vue` | `test/fns/special.test.ts` |
| clickable | `ev` | `fns/special.ts` | `test/fns/special.test.ts` |

#### 設定

| 設定 | 対応内容 |
| --- | --- |
| `advanced` | 無効時は`x2`-`x4`, `position`, `scale`の変形と、アニメーションを停止 |
| `animated` | 既定は`prefers-reduced-motion`の設定に応じて切り替え, `true`で常に再生, `false`で停止 |
| `nyaize` | `true`, `"respect"` |
| `plain`, `nowrap` | |

## パフォーマンス

- 構文解析は`text`, `plain`, `nestLimit`の変更時のみ実行します。解析済みのASTを`nodes`で渡すことで解析を省略できます
- テーマの解決結果は、同じ入力の`<Mfm>`間で共有します(最大32件)
- shiki, 言語定義, コードハイライトのテーマ, Unicode絵文字の名前一覧は、使用時にdynamic importで読み込まれます
- unixtimeの相対時刻は、すべての`<Mfm>`で1つのタイマー(10秒間隔)を共有し、ページの非表示中は更新しません

計測条件はApple M4 Max(RAM 128Gi), Node.js 24.21.0です。平均161文字のノート(メンション, ハッシュタグ, URL, 絵文字, 装飾, `$[...]`を含む)を使用し、値は中央値です。

| 処理 | 100件 | 1000件 |
| --- | --- | --- |
| 解析(`mfm.parse`)のみ | - | 90.5ms |
| SSR(`renderToString`) | 22.7ms | 222.0ms |
| SSR, `nodes`に解析済みの構文木を指定 | 12.1ms | - |
| SSR, テーマコードを指定 | 24.6ms | 235.9ms |
| DOMへのマウント(happy-dom) | 68.4ms | - |

`dist/index.js`は80.5KiB(gzip 21.9KiB), `dist/style.css`は20.0KiB(gzip 4.1KiB)です。依存パッケージを含みません。

## 開発

```sh
git submodule update --init   # AiScriptの構文定義
pnpm install
pnpm dev        # 開発サーバ(http://localhost:5173)
pnpm test       # Vitest
pnpm typecheck  # vue-tsc
pnpm lint       # ESLint
pnpm build      # dist/ へライブラリを出力
pnpm build:demo # demo/dist/ へデモを出力
pnpm compare <ノートのURL> # Misskeyのノートページとの描画比較(Headless Chrome)
```

### ディレクトリ構成

```
src/
  components/
    Mfm.vue                <Mfm>(props, 設定のマージ, 解析, ルート要素)
    defaults/*.vue         差し替え可能な既定の描画部品
  render/
    index.ts               ノード種別から変換関数を選択
    nodes/text.ts          text, plain
    nodes/format.ts        bold, strike, italic, small, center, quote
    nodes/link.ts          url, link, mention, hashtag
    nodes/emoji.ts         emojiCode, unicodeEmoji
    nodes/code.ts          inlineCode, blockCode, mathInline, mathBlock
    nodes/search.ts        search
    nodes/fn.ts            $[...]のハンドラの実行
    component.ts           slot, components設定の解決
    host.ts                ホストの確定
  fns/
    animation.ts           tada, jelly, twitch, shake, spin, jump, bounce, rainbow, sparkle
    transform.ts           flip, x2, x3, x4, rotate, position, scale
    style.ts               font, blur, fg, bg, border
    special.ts             ruby, unixtime, clickable
  styles/
    format.css             ルート要素, 書式
    fn.css                 $[...]の装飾, 変形
    animation.css          アニメーション, キーフレーム
  config.ts                provideMfmConfig, オプションの解決
  context.ts               <Mfm>から描画部品への設定共有
  highlight.ts             shikiによるトークン化
  i18n/                    同梱文言, 相対時刻の整形
  clock.ts                 相対時刻用の共有時計
  preview.ts               URLプレビューの取得, ホバー判定
  navigation.ts            サイト内遷移の判定
  media.ts                 メディアプロキシのURL規則
  theme.ts                 Misskey本家と同じ手順のテーマの解決
  theme-attrs.ts           テーマのCSS変数の出力
  emoji-name.ts            Unicode絵文字の名前
  emoji.ts                 絵文字URL生成関数
  utils.ts                 引数検証, nyaize
  types/                   公開型
    components.ts          描画部品のprops, slot
    fn.ts                  $[...]ハンドラ
    i18n.ts                文言
    options.ts             オプション
    preview.ts             URL, ユーザプレビュー
    theme.ts               テーマ
vendor/aiscript-vscode/    AiScriptの構文定義(git submodule)
demo/                      動作確認用デモ。MisskeyのテーマはGitHubから実行時に取得
scripts/                   distの読み込み検査, Misskeyとの描画比較
test/
  syntax/                  構文ごとのテスト
  fns/                     $[...]関数のテスト
  popup/                   URL, ユーザプレビューのテスト
  helpers.ts               描画用の補助関数
```

## ライセンス

MIT

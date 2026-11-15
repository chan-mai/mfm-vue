# 使い方

## 主要props

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

## i18n

`locale`の完全一致(`zh-tw`など), 言語部分(`ja-JP`なら`ja`)で指定可能です。`en`, `ja`等はMisskeyの表記に準拠しています。そのほか`zh`, `zh-TW`, `ko`, `fr`, `de`, `es`, `it`, `pt`, `ru`, `uk`, `pl`, `tr`, `id`, `th`, `vi`, `ar`を同梱しています。これらの言語の相対時刻は`Intl.RelativeTimeFormat`で表示されますが、サポートされていない言語は`en`の文言にフォールバックされるため、必要に応じて`messages`をoverrideしてください。

```ts
provideMfmConfig({
  locale: "fr-FR",
  messages: { search: "Rechercher", ago: { years: "il y a {n} ans" } },
});
```


## コードハイライト

shikiは初回のコードブロック描画時にdynamic importで読み込まれます。SSRとハイドレーションエラーを回避する目的で、`onMounted`発火後にハイライトされます。ライト・ダーク両テーマの色をCSS変数で出力するため、`colorScheme: "auto"`を明示した場合においてもOSの設定変更が反映されます。

AiScriptの構文定義は[aiscript-vscode](https://github.com/aiscript-dev/aiscript-vscode)(MIT, v0.1.16)に準拠しています。

## テーマ

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

## ユーザプレビュー

`createUserPreviewFetcher(endpoint)`は、Misskeyの`POST /api/users/show`の応答を変換する取得関数を作成します。フォロー数・フォロワー数は、公開範囲が`public`の場合のみ表示され、名前と自己紹介はMFMとして解釈・描画されます。フォロー等、一切の操作を含みません。

```ts
provideMfmConfig({
  userPreview: createUserPreviewFetcher("https://misskey.example/api/users/show"),
});
```

独自実装のコンポーネントから設定を参照する場合は`useMfmContext()`が利用可能です。

## URLプレビュー

取得処理は`urlPreview`に指定した関数で行います。`createUrlPreviewFetcher(endpoint, { lang })`は、Misskeyの`/url`エンドポイント(summaly)互換の応答を変換する取得関数を作成します。(一般に、)Misskeyの`/url`はCORSヘッダをレスポンスに含めないため、ブラウザから別オリジンのサーバを直接参照することはできません。同一オリジンで動かすかいい感じのサーバで中継してください(デモの開発サーバは中継しています)

```ts
provideMfmConfig({
  urlPreview: createUrlPreviewFetcher("/api/url-preview", { lang: "ja-JP" }),
});
```

## サイト内遷移

```ts
const router = useRouter();
provideMfmConfig({
  instanceUrl: "https://misskey.example",
  navigate: (path) => router.push(path),
  paths: { user: (acct) => `/users/${acct}` },
});
```

リンクの`href`は常に実際のURLです

## 設定の共有(`provideMfmConfig`)

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

## 描画の差し替え

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

## 関数構文の拡張

```ts
import { h } from "vue";
import type { MfmFnHandler } from "mfm-vue";

const highlight: MfmFnHandler = (ctx) =>
  h("mark", { class: "my-highlight" }, ctx.renderChildren());

// <Mfm :fns="{ highlight, blur: false }" />
```

ハンドラの戻り値が`null`の場合は、未知の関数として`$[name ...]`のまま表示します。`ctx`には`args`, `scale`, `renderChildren(scale?)`, `renderNodes(nodes)`, `transformText(text)`, `renderComponent(name, props)`, `emitClick(ev)`があります。

## 外部データの取得

本ライブラリに外部APIへのアクセス処理はありません。絵文字一覧などは利用側で取得し、オプションに指定する必要があります。

```ts
const emojis = shallowRef<Record<string, string>>({});
const res = await fetch("https://misskey.example/api/emojis");
const json = await res.json();
emojis.value = Object.fromEntries(json.emojis.map((e) => [e.name, e.url]));

provideMfmConfig(() => ({ customEmojis: emojis.value }));
```

## 絵文字URLの解決順序

1. `emojiUrls[name]`
2. 投稿者がリモートかつ`emojiUrls`が指定されている場合、`:name:`の文字列表示
3. `customEmojis`が関数の場合`customEmojis(name, host)`(`host`は取得元サーバの絵文字であれば`null`)
4. `customEmojis`がオブジェクトの場合、取得元サーバの絵文字に限り`customEmojis[name]`
5. いずれもなければ`url: null`(既定コンポーネントではテキスト表示)

## SSR

`renderToString`で描画できます。DOM APIに依存する処理(sparkleのパーティクル, unixtimeのローカル時刻表示)は`onMounted`以降に実行します。また、ハイドレーション時の不一致防止のため、unixtimeは`onMounted`発火までUTC表記で出力します。

## スタイル

スタイルはコンポーネント単位のscoped CSSです。`$[...]`などのASTから生成される要素は、`<Mfm>`の描画中に生成するため`<Mfm>`のscope属性が付与されます。アニメーションはクラスで指定し、`speed`, `delay`引数はインラインの`animation-duration`, `animation-delay`で上書きしています。


## 描画関数からの利用

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

# 対応状況

mfm.js 0.27.0の全構文と、Misskey本家が描画する全関数(24種類)に対応しています。

## 構文

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

## 関数: 色・スタイル

| 関数 | 引数 | 実装 | テスト |
| --- | --- | --- | --- |
| fg | `color` | `fns/style.ts` | `test/fns/style.test.ts` |
| bg | `color` | `fns/style.ts` | `test/fns/style.test.ts` |
| blur | | `fns/style.ts` | |
| font | `serif`, `monospace`, `cursive`, `fantasy`, `emoji`, `math` | `fns/style.ts` | `test/fns/style.test.ts` |
| border | `style`, `width`, `radius`, `color`, `noclip` | `fns/style.ts` | `test/fns/style.test.ts` |

## 関数: 変形

| 関数 | 引数 | 実装 | テスト |
| --- | --- | --- | --- |
| rotate | `deg` | `fns/transform.ts` | `test/fns/transform.test.ts` |
| scale | `x`, `y`(最大5倍) | `fns/transform.ts` | `test/fns/transform.test.ts` |
| position | `x`, `y` | `fns/transform.ts` | `test/fns/transform.test.ts` |
| flip | `h`, `v` | `fns/transform.ts` | `test/fns/transform.test.ts` |
| x2, x3, x4 | | `fns/transform.ts` | `test/fns/transform.test.ts` |

## 関数: アニメーション

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

## 関数: その他

| 関数 | 引数 | 実装 | テスト |
| --- | --- | --- | --- |
| ruby | | `fns/special.ts` | `test/fns/special.test.ts` |
| unixtime | | `fns/special.ts`, `defaults/Unixtime.vue` | `test/fns/special.test.ts` |
| clickable | `ev` | `fns/special.ts` | `test/fns/special.test.ts` |

## 設定

| 設定 | 対応内容 |
| --- | --- |
| `advanced` | 無効時は`x2`-`x4`, `position`, `scale`の変形と、アニメーションを停止 |
| `animated` | 既定は`prefers-reduced-motion`の設定に応じて切り替え, `true`で常に再生, `false`で停止 |
| `nyaize` | `true`, `"respect"` |
| `plain`, `nowrap` | |

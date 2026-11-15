# コントリビュートガイド

mfm-vueへの貢献を検討いただきありがとうございます。issue・プルリクエストの送信前に、このガイドをお読みください。

## はじめに

- 不具合の報告や機能の提案は、issueのテンプレートに沿って作成してください
- Misskey本家と描画結果が異なる場合は、「Misskey本家との描画差異」のテンプレートで報告してください
- 大きな変更やAPIに関わる変更は、原則として実装前にissueで方針を相談してください
- 小さな修正(誤字, 明らかな不具合)は、直接プルリクエストを送っていただいて構いません

## 開発環境

Node.js 24以降とpnpmが必要です。

```sh
git clone --recurse-submodules https://github.com/chan-mai/mfm-vue.git
pnpm i
pnpm dev  # デモ(http://localhost:5173)
```

クローン済みの場合は`git submodule update --init`でAiScriptの構文定義を取得してください。

### コマンド

```sh
pnpm test       # Vitest
pnpm typecheck  # vue-tsc
pnpm lint       # ESLint
pnpm build      # dist/ へライブラリを出力
pnpm build:demo # demo/dist/ へデモを出力
pnpm compare <ノートのURL> # Misskeyのノートページとの描画比較(Headless Chrome)
```

## 変更の進め方

- 構文の描画は`src/render/nodes/`, `$[...]`の関数は`src/fns/`, 差し替え可能な描画部品は`src/components/defaults/`に追加してください
- 公開する型は`src/types/`に定義し、`src/index.ts`から公開してください
- 文言を追加する場合は、`src/i18n/`の同梱言語すべてに追加してください。Misskey本家に同じ文言がある場合は、本家の各言語の訳を使ってください

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

### Misskey本家との互換性

- 描画結果は、Misskey本家の最新版(`develop`)に合わせてください
- 本家と異なる挙動にする場合は、プルリクエストに差異の内容と理由を明記してください
- 描画に関わる変更は、`pnpm compare <ノートのURL>`で本家との差分がないことを確認してください

### Misskeyのコードの扱い

MisskeyのソースコードはAGPL-3.0です。本プロジェクトはMITのため、Misskeyのコードを複製・移植しないでください。挙動を仕様として参照し、独自に実装してください。第三者のコードや素材を同梱する場合は、`THIRD_PARTY_NOTICES.md`にライセンスを記載してください。

## コーディング

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`が通ることを確認してください
- 挙動の変更・追加にはテストを追加してください
- 既存のコードの書き方(命名, コメントの量, 構成)に合わせてください

## コミット・プルリクエスト

- コミットメッセージは[Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/)に則ってください
- プルリクエストは`develop`ブランチへ送ってください
- 1つのプルリクエストには1つの目的の変更のみを含めてください
- プルリクエストのテンプレートの確認項目を満たしてください
- 見た目の変更にはスクリーンショットを添付してください

## LLM・コーディング支援ツールの利用

LLMなどの生成ツールを使って作成したコード・文章を投稿することは可能ですが、その内容の責任はすべて投稿者が負います。

- 生成された内容は、投稿者自身がすべてレビューしてください
- 実装の意図と挙動を投稿者自身が理解し、実際に動作させて確認してください
- 説明できない変更や、動作を確認していない変更は投稿しないでください
- issueやプルリクエストの本文, レビューへの返信も、内容を確認したうえで投稿してください
- 生成ツールへの丸投げ(出力をそのまま投稿する行為)は禁止します

確認が行われていないと判断したissue・プルリクエストは、理由を示したうえでクローズすることがあります。

## ライセンス

投稿された貢献は、本プロジェクトと同じMITライセンスのもとで公開されます。

# mfm-vue

[![npm](https://img.shields.io/npm/v/mfm-vue?style=flat-square&logo=npm&logoColor=white&label=npm&color=86b300)](https://www.npmjs.com/package/mfm-vue)
[![CI](https://img.shields.io/github/actions/workflow/status/chan-mai/mfm-vue/ci.yaml?branch=develop&style=flat-square&logo=github&logoColor=white&label=CI&color=86b300)](https://github.com/chan-mai/mfm-vue/actions/workflows/ci.yaml)
[![License](https://img.shields.io/npm/l/mfm-vue?style=flat-square&label=license&color=86b300)](./LICENSE)
[![Demo](https://img.shields.io/badge/demo-mfm--vue--demo.mq1.dev-86b300?style=flat-square&logo=cloudflareworkers&logoColor=white)](https://mfm-vue-demo.mq1.dev/)

![Vue](https://img.shields.io/badge/Vue_3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Misskey](https://img.shields.io/badge/Misskey-86B300?style=flat-square&logo=misskey&logoColor=white)

Vue 3向けの[MFM](https://misskey-hub.net/ja/docs/for-users/features/mfm/)レンダラです。構文解析には[mfm.js](https://github.com/misskey-dev/mfm.js)を利用しています。

他実装とは異なり、Misskey本家との描画結果の完全な互換性を重視しており、mfm.js 0.27.0の全構文とMisskeyが描画する全関数(24種類)に対応しています。

## 特徴

- `<Mfm>`を通常のVueコンポーネントとしてimportして利用可能で、`app.use()`やグローバル登録は不要です
- リンク, メンション, ハッシュタグ, 絵文字, コード, 数式などの描画をコンポーネント/slotで差し替えることができます
- 独自関数の追加や組み込み関数の上書き・無効化をサポートしています
- AST変換は描画関数で行い構文ノードごとのコンポーネント生成を行っていません(リンク/絵文字等の描画部品はSFCで、SSRとハイドレーションに対応しています)
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

## ドキュメント

- [使い方](./docs/usage.md)
- [対応状況](./docs/compatibility.md)
- [パフォーマンス](./docs/performance.md)
- [開発](./CONTRIBUTING.md)

## ライセンス

MIT

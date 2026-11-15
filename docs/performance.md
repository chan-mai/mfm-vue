# パフォーマンス

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

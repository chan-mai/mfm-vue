export interface Sample {
	id: string;
	label: string;
	text: string;
}

const BASIC = `**Bold** <i>Italic</i> ~~Strike~~ <small>small</small>
> 引用 **bold in quote**
<center>Center</center>
@syuilo @ai@misskey.io #Misskey #ミスキー
https://misskey-hub.net/ja/docs/ [リンク **太字**](https://example.com)
:misskey: :ai_yay: 👍 🍮
\`inline code\` \\(E = mc^2\\)
\`\`\`js
const hello = "world";
\`\`\`
misskey 検索

$[tada tada] $[jelly jelly] $[twitch twitch] $[shake shake] $[jump jump] $[bounce bounce]
$[spin spin] $[spin.left spin.left] $[spin.x spin.x] $[spin.y,speed=0.5s spin.y]
$[flip flip] $[flip.v flip.v] $[flip.h,v flip.h,v]
$[x2 x2] $[x3 x3] $[x4 x4]
$[font.serif serif] $[font.monospace monospace] $[font.cursive cursive]
$[blur blur] $[rainbow rainbow] $[sparkle sparkle]
$[rotate.deg=30 rotate] $[position.x=1,y=0.5 position] $[scale.x=2,y=1 scale]
$[fg.color=f80 fg] $[bg.color=8cf bg] $[border.style=dashed,color=f0f,radius=8,width=2 border]
$[ruby 漢字 かんじ] $[ruby $[fg.color=f00 赤] あか]
$[unixtime 1700000000]
$[clickable.ev=hello クリック可能]
$[unknown 未知の関数]
<plain>**plain** :misskey:</plain>`;

const SYNTAX = `<plain>**plain** :misskey: @ai #tag $[x2 a]</plain>
**太字** __太字__ <b>太字</b> *斜体* _斜体_ <i>斜体</i> ~~打消~~ <s>打消</s> <small>小さい</small>
**太字の中の<i>斜体</i>と~~打消~~と\`code\`と:misskey:**
> 引用 **太字** @ai https://example.com
> > 入れ子の引用
<center>中央 **太字** :misskey:</center>
@ai @syuilo @ai@misskey.io @user@例え.jp @user@xn--r8jz45g.jp
#Misskey #ミスキー #tag_123 #tag(括弧) #絵文字👍
https://misskey-hub.net/ja/docs/?a=1&b=2#top https://例え.jp/パス <https://example.com/a(b)c> https://example.com/p(paren)
[リンク](https://example.com) [**太字**と:misskey:](https://example.com/a) ?[サイレント](https://example.com/s) [@ai #tag](https://example.com)
:misskey: :nonexistent_emoji: :misskey::misskey:
👍 ☺ ☺️ © ©️ 1️⃣ 🇯🇵 👍🏽 👨‍👩‍👧‍👦 🏳️‍🌈
\`inline code\` \`<b>タグ</b>\` \`\` \` \`\`
\\(E = mc^2\\) \\(\\frac{1}{2}\\)
\\[\\sum_{i=1}^n i\\]
\`\`\`js
const a = "hello"; // コメント
\`\`\`
\`\`\`aiscript
let x = "hello"
<: \`{x} world\`
\`\`\`
\`\`\`unknownlang
plain text
\`\`\`
\`\`\`
言語なし	タブ	区切り
\`\`\`
misskey 検索
mfm Search
ミスキー [検索]
example [Search]`;

const FUNCTIONS = `$[tada tada] $[tada.speed=2s,delay=0.5s 遅延] $[jelly jelly] $[jelly.speed=0.5s 速い]
$[twitch twitch] $[shake shake] $[jump jump] $[bounce bounce]
$[spin spin] $[spin.left 左] $[spin.alternate 往復] $[spin.x 縦] $[spin.y 横] $[spin.x,left,speed=3s 組合せ]
$[flip 左右] $[flip.v 上下] $[flip.h,v 両方]
$[x2 x2] $[x3 x3] $[x4 x4] $[x2 $[x2 二重]] $[x4 $[x4 $[x4 三重]]] $[x4 :misskey:]
$[scale.x=2,y=1 横2倍] $[scale.x=0.5,y=3 縦3倍] $[scale.x=10,y=10 上限] $[scale.x=-1 反転] $[scale 既定]
$[position.x=1,y=0.5 移動] $[position.x=-2 左] $[position 既定]
$[rotate 既定] $[rotate.deg=30 30度] $[rotate.deg=-45 負]
$[fg.color=f00 3桁] $[fg.color=f80a 4桁] $[fg.color=ff8800 6桁] $[fg.color=red 不正] $[fg 未指定]
$[bg.color=8cf 3桁] $[bg.color=ffcc00 6桁] $[bg 未指定]
$[font.serif serif] $[font.monospace mono] $[font.cursive cursive] $[font.fantasy fantasy] $[font.emoji emoji] $[font.math math] $[font 未指定]
$[blur ぼかし] $[rainbow 虹] $[rainbow.speed=3s 遅い虹] $[sparkle キラキラ]
$[border 既定] $[border.style=dashed,color=f0f,radius=8,width=2 破線] $[border.style=dotted 点線] $[border.style=double,width=4 二重] $[border.style=groove,width=4 groove] $[border.style=ridge,width=4 ridge] $[border.style=inset,width=4 inset] $[border.style=outset,width=4 outset] $[border.style=hidden 非表示] $[border.style=invalid 不正] $[border.radius=99,noclip $[x2 はみ出し]]
$[ruby 漢字 かんじ] $[ruby $[fg.color=f00 赤] あか] $[ruby **太字** ふとじ]
$[unixtime 1700000000] $[unixtime 0] $[unixtime 9999999999] $[unixtime abc]
$[clickable.ev=hello クリック] $[clickable ev未指定]
$[unknown 未知の関数] $[tada.speed=abc 不正な時間] $[x2.foo=bar 未知の引数]
$[x2 $[fg.color=f00 $[spin $[border.radius=4 入れ子]]]]`;

const EDGE_CASES = `長いURL https://example.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
長い単語 Pneumonoultramicroscopicsilicovolcanoconiosis_Pneumonoultramicroscopicsilicovolcanoconiosis
	タブ字下げ  連続空白  末尾空白


<script>alert(1)</script> &amp; &lt;b&gt;
[javascript](javascript:alert(1)) javascript:alert(1) ftp://example.com/file
なななな ナナ なんなん 나나 morning everyone
<plain>なな</plain> \`なな\` [なな](https://example.com) > なな
**@ai #tag https://example.com :misskey: 👍**
$[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg $[fg 深い]]]]]]]]]]]]]]]]]]]]]]]]]`;

export const SAMPLES: readonly Sample[] = [
	{ id: 'basic', label: '基本', text: BASIC },
	{ id: 'syntax', label: '全構文', text: SYNTAX },
	{ id: 'functions', label: '全関数', text: FUNCTIONS },
	{ id: 'edge', label: '境界条件', text: EDGE_CASES },
];

import type { VNodeChild } from 'vue';
import type { MfmFn, MfmNode } from 'mfm-js';
import type { MfmComponentName, MfmComponentPropsMap } from './components.js';
import type { ResolvedMfmOptions } from './options.js';

export interface MfmFnContext {
	name: string;
	args: Record<string, string | true>;
	node: MfmFn;
	// 親要素までの累積拡大率
	scale: number;
	options: ResolvedMfmOptions;
	renderChildren: (scale?: number) => VNodeChild[];
	renderNodes: (nodes: readonly MfmNode[], scale?: number) => VNodeChild[];
	// nyaize等の文字列変換を適用
	transformText: (text: string) => string;
	// スロット, components設定を考慮して描画
	renderComponent: <K extends MfmComponentName>(
		name: K,
		props: MfmComponentPropsMap[K],
		children?: VNodeChild[],
	) => VNodeChild;
	emitClick: (ev: string) => void;
}

// null, undefined時元記法で描画
export type MfmFnHandler = (ctx: MfmFnContext) => VNodeChild | null | undefined;

import type { VNodeChild } from 'vue';
import type { MfmNode } from 'mfm-js';
import type { MfmSlots, ResolvedMfmOptions } from '../types/index.js';

export interface MfmRenderContext {
	options: ResolvedMfmOptions;
	plain: boolean;
	nowrap: boolean;
	slots: MfmSlots;
	emitClick: (ev: string) => void;
}

export interface NodeRenderState {
	ctx: MfmRenderContext;
	// 親要素までの累積拡大率
	scale: number;
	// nyaize除外中
	noNyaize: boolean;
	renderNodes: (
		nodes: readonly MfmNode[],
		overrides?: { scale?: number; noNyaize?: boolean },
	) => VNodeChild[];
}

export type NodeRenderer<N extends MfmNode> = (
	node: N,
	state: NodeRenderState,
) => VNodeChild;

export type NodeRendererMap = {
	[T in MfmNode['type']]: NodeRenderer<Extract<MfmNode, { type: T }>>;
};

import { computed, inject } from 'vue';
import { resolveMfmOptions } from './config.js';
import type { ComputedRef, InjectionKey } from 'vue';
import type { ResolvedMfmOptions } from './types/index.js';

// <Mfm>から描画部品へ解決済みオプションを共有
export const mfmContextKey: InjectionKey<ComputedRef<ResolvedMfmOptions>> =
	Symbol('mfm-context');

export function useMfmContext(): ComputedRef<ResolvedMfmOptions> {
	return inject(
		mfmContextKey,
		computed(() => resolveMfmOptions({})),
		true,
	);
}

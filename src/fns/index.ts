import { animationFns } from './animation.js';
import { specialFns } from './special.js';
import { styleFns } from './style.js';
import { transformFns } from './transform.js';
import type { MfmFnHandler } from '../types/index.js';

export const builtinFns: Readonly<Record<string, MfmFnHandler>> = {
	...animationFns,
	...transformFns,
	...styleFns,
	...specialFns,
};

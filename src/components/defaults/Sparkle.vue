<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useMfmContext } from '../../context.js';

interface Particle {
	id: number;
	x: number;
	y: number;
	size: number;
	duration: number;
	color: string;
}

const COLORS = ['#ff1493', '#00ffff', '#ffe202', '#ffe202', '#ffe202'] as const;
const STAR_PATH =
	'M32 0C34 22 42 30 64 32C42 34 34 42 32 64C30 42 22 34 0 32C22 30 30 22 32 0Z';
const MARGIN = 32;

const ctx = useMfmContext();
const el = ref<HTMLElement | null>(null);
const particles = ref<Particle[]>([]);
const width = ref(0);
const height = ref(0);
const timers = new Set<ReturnType<typeof setTimeout>>();
let observer: ResizeObserver | null = null;
let nextId = 0;
let stopped = false;

function later(fn: () => void, ms: number) {
	const t = setTimeout(() => {
		timers.delete(t);
		fn();
	}, ms);
	timers.add(t);
}

function spawn() {
	if (stopped) return;
	const factor = Math.random();
	const particle: Particle = {
		id: nextId++,
		x: Math.random() * (width.value - MARGIN * 2),
		y: Math.random() * (height.value - MARGIN * 2),
		size: 0.2 + (factor / 10) * 3,
		duration: 1000 + factor * 1000,
		color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0],
	};
	particles.value = [...particles.value, particle];
	later(() => {
		particles.value = particles.value.filter((p) => p.id !== particle.id);
	}, particle.duration - 100);
	later(spawn, 500 + Math.random() * 500);
}

function measure() {
	if (!el.value) return;
	width.value = el.value.offsetWidth + MARGIN * 2;
	height.value = el.value.offsetHeight + MARGIN * 2;
}

// NOTE: ハイドレーション一致のためクライアントのみパーティクルあり
onMounted(() => {
	if (
		ctx.value.motionAuto &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	) {
		return;
	}
	measure();
	if (typeof ResizeObserver !== 'undefined' && el.value) {
		observer = new ResizeObserver(measure);
		observer.observe(el.value);
	}
	spawn();
});

onBeforeUnmount(() => {
	stopped = true;
	observer?.disconnect();
	for (const t of timers) clearTimeout(t);
	timers.clear();
});
</script>

<template>
<span class="mfm-sparkle">
	<span ref="el" class="content"><slot></slot></span>
	<svg
		v-for="p in particles"
		:key="p.id"
		class="layer"
		:width="width"
		:height="height"
		:viewBox="`0 0 ${width} ${height}`"
		aria-hidden="true"
	>
		<path
			class="particle"
			:d="STAR_PATH"
			:fill="p.color"
			:style="{
				'--x': `${p.x}px`,
				'--y': `${p.y}px`,
				'--size': String(p.size),
				'--duration': `${p.duration}ms`,
			}"
		/>
	</svg>
</span>
</template>

<style scoped>
.mfm-sparkle {
	position: relative;
	display: inline-block;
}

.content {
	display: inline-block;
}

.layer {
	position: absolute;
	top: -32px;
	left: -32px;
	pointer-events: none;
}

.particle {
	transform-origin: center;
	transform-box: fill-box;
	translate: var(--x) var(--y);
	animation: particle var(--duration) linear infinite;
}

@keyframes particle {
	0% {
		rotate: 0deg;
		scale: 0;
	}
	50% {
		scale: var(--size);
	}
	100% {
		rotate: 360deg;
		scale: 0;
	}
}
</style>

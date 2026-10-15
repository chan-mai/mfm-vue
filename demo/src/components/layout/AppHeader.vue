<script setup lang="ts">
import pkg from '../../../../package.json';

const LINKS = [
	{
		label: 'GitHub',
		href: 'https://github.com/chan-mai/mfm-vue',
		color: '#24292f',
		icon: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
	},
	{
		label: 'npm',
		href: 'https://www.npmjs.com/package/mfm-vue',
		color: '#cb3837',
		icon: 'M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z',
	},
] as const;
</script>

<template>
<header data-reveal class="flex flex-wrap items-end justify-between gap-4">
	<div class="flex flex-col gap-1">
		<h1 class="flex items-baseline gap-2 text-2xl font-bold tracking-tight">
			<span class="text-accent">mfm-vue</span>
			<span class="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-xs text-accent-strong dark:text-accent">v{{ pkg.version }}</span>
		</h1>
		<p class="text-sm opacity-70 -mt-2">MFM (Misskey Flavored Markdown) renderer for Vue 3</p>
	</div>
	<nav class="flex gap-2">
		<a
			v-for="link in LINKS"
			:key="link.label"
			:href="link.href"
			target="_blank"
			rel="noopener"
			class="group inline-flex items-center gap-2 rounded-full bg-white py-1 pr-3.5 pl-1 text-sm font-bold shadow-sm ring-1 ring-black/5 transition duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40 dark:bg-white/10 dark:ring-white/10"
		>
			<span
				class="grid size-7 place-items-center rounded-full text-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-12"
				:style="{ backgroundColor: link.color }"
			>
				<svg class="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path :d="link.icon"/>
				</svg>
			</span>
			{{ link.label }}
		</a>
	</nav>
</header>
</template>

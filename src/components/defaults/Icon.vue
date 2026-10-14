<script setup lang="ts">
defineProps<{ name: 'external' | 'search' | 'copy' | 'clock' | 'code' }>();
</script>

<template>
<svg class="icon" viewBox="0 2.625 24 18.75" aria-hidden="true">
	<template v-if="name === 'external'">
		<path d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>
		<path d="M11 13l9-9"/>
		<path d="M15 4h5v5"/>
	</template>
	<template v-else-if="name === 'search'">
		<circle cx="10" cy="10" r="7"/>
		<path d="M21 21l-6-6"/>
	</template>
	<template v-else-if="name === 'copy'">
		<path
			d="M7 9.667a2.667 2.667 0 0 1 2.667-2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1-2.667 2.667h-8.666a2.667 2.667 0 0 1-2.667-2.667z"
		/>
		<path d="M4.012 16.737a2.005 2.005 0 0 1-1.012-1.737v-10c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/>
	</template>
	<template v-else-if="name === 'code'">
		<path d="M7 8l-4 4 4 4"/>
		<path d="M17 8l4 4-4 4"/>
		<path d="M14 4l-4 16"/>
	</template>
	<template v-else>
		<circle cx="12" cy="12" r="9"/>
		<path d="M12 7v5l3 3"/>
	</template>
</svg>
</template>

<style scoped>
.icon {
	width: 1.28em;
	height: 1em;
	overflow: visible;
	vertical-align: -0.12em;
	fill: none;
	stroke: currentColor;
	stroke-width: 2;
	stroke-linecap: round;
	stroke-linejoin: round;
}
</style>

<script setup lang="ts">
import { useId } from 'vue';

defineProps<{ label: string; placeholder?: string }>();

const model = defineModel<string>({ required: true });
const id = useId();
</script>

<template>
<div class="flex flex-col gap-1 py-1">
	<label :for="id" class="font-mono text-[13px]">{{ label }}</label>
	<input :id="id" v-model="model" class="field" :placeholder="placeholder" spellcheck="false"/>
</div>
</template>

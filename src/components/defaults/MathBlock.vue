<script setup lang="ts">
import type { MfmMathProps } from '../../types/index.js';

defineProps<MfmMathProps>();
</script>

<template>
<code class="mfm-math-block">{{ formula }}</code>
</template>

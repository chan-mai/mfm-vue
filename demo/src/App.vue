<script setup lang="ts">
import AppFooter from './components/layout/AppFooter.vue';
import AppHeader from './components/layout/AppHeader.vue';
import IndexPage from './pages/index.vue';
</script>

<template>
<div class="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6">
	<AppHeader/>
	<IndexPage/>
	<AppFooter/>
</div>
</template>

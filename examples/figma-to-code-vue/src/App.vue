<template>
  <main class="page">
    <StatsPanel />
  </main>
</template>

<script setup lang="ts">
import StatsPanel from "./components/StatsPanel.vue";
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f3f4f6;
}
</style>

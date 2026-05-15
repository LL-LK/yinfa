<template>
  <div :class="['app-container', 'font-mode-' + appStore.fontSizeMode]">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <TabBar v-if="showTabBar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from './stores/app'
import TabBar from './components/TabBar.vue'

const route = useRoute()
const appStore = useAppStore()

const tabRoutes = ['/', '/scenic', '/safety', '/user']
const showTabBar = computed(() => tabRoutes.includes(route.path))
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
}
</style>
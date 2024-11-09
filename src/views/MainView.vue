<script setup lang="ts">
import { useData } from 'vitepress';
import { VPHomeContent } from 'vitepress/theme';
import StarField from '../components/StarField.vue';

const { isDark } = useData();
</script>

<template>
  <VPHomeContent>
    <StarField
      v-if="isDark"
      class="background"
    />
    <div class="main">
      <div class="intro">
        <p>
          Hi, I'm Nicolas Martinez, a full-stack developer based in Toronto,
          Canada. I've had the opportunity to work across IoT, Cloud, and Web
          technologies, building systems that connect the physical and digital
          spaces. I'm currently part of a solar technology company, where I get
          to apply my passion for software to projects that contribute to a
          sustainable future.
        </p>
        <p>
          This site is a showcase of my projects and the things I've built—a
          place to share demos, experiments, and creative work. Feel free to
          explore, and reach out if you'd like to connect!
        </p>
      </div>
    </div>
  </VPHomeContent>
</template>

<style scoped>
.background {
  position: absolute;
  top: var(--vp-nav-height, 0px);
  left: 0;
  width: 100vw;
  height: calc(100vh - var(--vp-nav-height, 0px));
  z-index: -1;
}

.main {
  width: 100%;
  margin-top: 100px;
}

.intro {
  max-width: 640px;
  text-align: center;
  margin: 0 auto;
  font-size: 18px;
  background-color: var(--vp-c-bg);
  box-shadow: 0px 0px 20px 10px var(--vp-c-bg);
}
</style>

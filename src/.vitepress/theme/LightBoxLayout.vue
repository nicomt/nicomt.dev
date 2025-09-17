<script lang="ts" setup>
import DefaultTheme from 'vitepress/theme';
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vitepress';
import PhotoSwipeLightbox from 'photoswipe/lightbox';

import 'photoswipe/style.css';

const { Layout } = DefaultTheme;
let lightbox: PhotoSwipeLightbox | null = null;
const router = useRouter();

const initLightbox = () => {
  if (!lightbox) {
    lightbox = new PhotoSwipeLightbox({
      gallery: '.gallery-page p:has(img)',
      children: 'a',
      pswpModule: () => import('photoswipe'),
    });
    lightbox.init();
  }
};

const destroyLightbox = () => {
  if (lightbox) {
    lightbox.destroy();
    lightbox = null;
  }
};

router.onAfterRouteChanged = () => {
  destroyLightbox();
  initLightbox();
};

onMounted(() => {
  initLightbox();
});

onUnmounted(() => {
  destroyLightbox();
});
</script>

<template>
  <Layout />
</template>

<style>
.medium-zoom-overlay {
  backdrop-filter: blur(5rem);
}

.medium-zoom-overlay,
.medium-zoom-image--opened {
  z-index: 999;
}
</style>

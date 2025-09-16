<script lang="ts" setup>
import DefaultTheme from 'vitepress/theme';
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vitepress';
import PhotoSwipeLightbox from 'photoswipe/lightbox';

import 'photoswipe/style.css';

const { Layout } = DefaultTheme;
const router = useRouter();

let lightbox: PhotoSwipeLightbox | null = null;

const initLightbox = () => {
  if (lightbox) {
    lightbox.destroy();
    lightbox = null;
  }
  lightbox = new PhotoSwipeLightbox({
    gallery: '.gallery-page p:has(img)',
    children: 'a',
    pswpModule: () => import('photoswipe')
  });
  lightbox.init();
};

onMounted(() => {
  initLightbox();
  router.onAfterRouteChanged = () => {
    if (lightbox) {
      lightbox.refresh();
    } else {
      initLightbox();
    }
  };
});

onUnmounted(() => {
  if (lightbox) {
    lightbox.destroy();
    lightbox = null;
  }
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

/* Ensure PhotoSwipe overlays appear above site chrome */
.pswp {
  z-index: 9999;
}

/* Make sure large images scale to fit viewport */
.pswp__img {
  object-fit: contain;
}
</style>

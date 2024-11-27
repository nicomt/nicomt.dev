<script lang="ts" setup>
import DefaultTheme from 'vitepress/theme';
import { onMounted } from 'vue';
import { useRouter } from 'vitepress';
import PhotoSwipeLightbox from 'photoswipe/lightbox';

import 'photoswipe/style.css';

const { Layout } = DefaultTheme;
const router = useRouter();

const setupPhotoswipe = () => {
  const lightbox = new PhotoSwipeLightbox({
    gallery: '.gallery-page p:has(img)',
    children: 'a',
    pswpModule: () => import('photoswipe')
  });
  lightbox.init();
};

onMounted(setupPhotoswipe);

router.onAfterRouteChanged = setupPhotoswipe;
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

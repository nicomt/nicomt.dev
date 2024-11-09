<script setup lang="ts">
import { ref, watch, onMounted, onBeforeMount} from 'vue';
import { useResizeObserver, templateRef } from '@vueuse/core';
// @ts-expect-error: Worker types don't seem to work
import StarfieldWorker from '../workers/starfield.worker.ts?worker';


const container = templateRef('container');
const canvas = templateRef('canvas');
const viewSize = ref({ width: 0, height: 0 });
let worker: Worker | null = null



const skySize = 800;
const time = new Date();
const latitude = 43.6532;
const longitude = -79.3832;

defineOptions()


useResizeObserver(container, (entries) => {
  const entry = entries[0];
  const { width, height } = entry.contentRect;
  viewSize.value = { width, height };
});

watch(viewSize, () => {
  const { width, height } = viewSize.value;
  worker?.postMessage({
    type: 'update',
    time,
    latitude,
    longitude,
    skySize,
    viewSize: { width, height },
  });
});

onMounted(() => {
  if (!canvas.value) return;
  viewSize.value = {
    width: container.value.clientWidth,
    height: container.value.clientHeight,
  };
  if (!worker) {
    worker = new StarfieldWorker();
  }
  const offscreen = canvas.value.transferControlToOffscreen();
  worker?.postMessage({ type: 'init', canvas: offscreen }, [offscreen]);
});

onBeforeMount(() => {
  worker?.terminate();
});

</script>

<template>
  <div ref="container" class="sky-container">
    <canvas ref="canvas" ></canvas>
  </div>
</template>

<style scoped>
.sky-container {
  overflow: hidden;
}

.star-twinkle {
  animation-name: twinkle;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes twinkle {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

@keyframes shooting-star-animation {
  from {
    transform: translate(0, 0);
  }

  to {
    transform: translate(100vw, 100vh);
    opacity: 0;
  }
}

.shooting-star {
  animation-name: shooting-star-animation;
  animation-timing-function: linear;
  animation-duration: 5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}
</style>

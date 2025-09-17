import { defineConfig } from 'vitepress';
import { imagetools } from 'vite-imagetools';
import customBlock from './mdit';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'Nicolas Martinez',
  description: 'My site and blog',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/projects/bird-sentry/hardware.md' },
    ],
    sidebar: [
      {
        text: 'Projects',
        items: [
          {
            text: 'Bird Sentry',
            items: [{ text: 'Hardware', link: '/projects/bird-sentry/hardware.md' }],
          },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nicomt' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/nicomt' },
    ],
    editLink: {
      pattern: 'https://github.com/nicomt/nicomt.dev/edit/main/src/:path',
    },
  },
  vue: {
    template: {
      transformAssetUrls: {
        base: null,
        includeAbsolute: true,
        a: ['href'],
        video: ['src', 'poster'],
        source: ['src'],
        img: ['src'],
        image: ['xlink:href', 'href'],
        use: ['xlink:href', 'href'],
      },
    },
  },
  vite: {
    plugins: [imagetools()],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
  markdown: {
    preConfig(md) {
      md.use(customBlock, {
        video(url, attrs) {
          return `
            <video ${attrs}>
                <source src="${url}" type="video/mp4">
            </video>
          `;
        },
      });
    },
  },
});

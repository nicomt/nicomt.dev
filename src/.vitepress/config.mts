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
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v58q0 59-40.5 100.5T740-280q-35 0-66-15t-52-43q-29 29-65.5 43.5T480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480v58q0 26 17 44t43 18q26 0 43-18t17-44v-58q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93h200v80H480Zm0-280q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z"/></svg>',
        },
        link: 'mailto:me@nicomt.dev',
      },
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

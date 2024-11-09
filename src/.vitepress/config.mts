import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'Nicolas Martinez',
  description: 'My site and blog',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/blog/coming-soon.md' },
    ],

    sidebar: [
      {
        text: 'Blog',
        items: [{ text: 'Coming Soon', link: '/blog/coming-soon.md' }],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nicomt' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/nicomt' },
    ],
  },
  vite: {
    build: {
      sourcemap: true,
    },
  },
});

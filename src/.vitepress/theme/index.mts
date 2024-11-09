import DefaultTheme from 'vitepress/theme';
import MainView from '../../views/MainView.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MainView', MainView);
  },
};

import DefaultTheme from 'vitepress/theme';
import LightBoxLayout from './LightBoxLayout.vue';
import MainView from '../../views/MainView.vue';
import './custom.scss'

export default {
  extends: DefaultTheme,
  Layout: LightBoxLayout,
  enhanceApp({ app }) {
    app.component('MainView', MainView);
  },
};

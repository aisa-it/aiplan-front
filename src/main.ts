import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { vMaska } from 'maska/vue';
import './styles/tailwind.css';
import './css/fonts.scss';
import './styles/main.scss';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { i18n, i18nReady } from './i18n';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(vuetify);
app.directive('maska', vMaska);
void i18nReady.then(() => app.mount('#app'));

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { vMaska } from 'maska/vue';
import './styles/tailwind.css';
import './css/fonts.scss';
import './styles/main.scss';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.directive('maska', vMaska);
app.mount('#app');

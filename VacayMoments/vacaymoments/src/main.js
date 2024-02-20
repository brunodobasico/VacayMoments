import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import AppHeader from './components/AppHeader.vue';

createApp(App).component('app-header', AppHeader);

createApp(App).use(router).mount('#app');

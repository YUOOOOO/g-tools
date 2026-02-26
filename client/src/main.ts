import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Home from './views/Home.vue';
import Sentiment from './views/Sentiment.vue';
import Intel from './views/Intel.vue';
import Settings from './views/Settings.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/sentiment', component: Sentiment },
    { path: '/intel', component: Intel },
    { path: '/settings', component: Settings }
  ]
});

createApp(App).use(router).mount('#app');

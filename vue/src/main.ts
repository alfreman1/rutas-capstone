import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import 'primevue/resources/themes/aura-light-blue/theme.css';
import 'primeicons/primeicons.css';
import './assets/style.css';

import App from './app/App.vue';
import router from './app/router';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);
app.use(PrimeVue, { ripple: true });
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');

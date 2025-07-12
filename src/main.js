import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import PermissionDirectives from './directives/permission';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';

import { useAuthStore } from '@/stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(PermissionDirectives);

// Initialize auth store before mounting the app
const authStore = useAuthStore();

// Initialize auth store and then mount app
authStore.initialize().then(() => {
  console.log('Auth store initialized, mounting app...')
  app.mount('#app')
}).catch((error) => {
  console.error('Failed to initialize auth store:', error)
  // Mount app anyway
  app.mount('#app')
});

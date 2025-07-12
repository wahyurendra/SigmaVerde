import { createApp } from 'vue';
import App from './App.vue';
import PermissionDirectives from './directives/permission';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';

import { useAuthStore } from './stores/authStore';
import pinia from './stores/index';

const app = createApp(App);

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

const authStore = useAuthStore();
authStore.initializeAuth();

app.mount('#app');

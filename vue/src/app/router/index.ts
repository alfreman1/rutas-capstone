import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';
import MainLayout from '../layouts/MainLayout.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('../../modules/auth/pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../../modules/dashboard/pages/DashboardPage.vue'),
      },
      {
        path: 'contratos',
        name: 'Contratos',
        component: () => import('../../modules/contratos/pages/ContratosPage.vue'),
      },
      {
        path: 'contratos/:id',
        name: 'ContratoDetalle',
        component: () => import('../../modules/contratos/pages/ContratoDetallePage.vue'),
      },
      {
        path: 'planificaciones/:id',
        name: 'PlanificacionDetalle',
        component: () => import('../../modules/planificaciones/pages/PlanificacionDetallePage.vue'),
      },
      {
        path: 'vehiculos',
        name: 'Vehiculos',
        component: () => import('../../modules/vehiculos/pages/VehiculosPage.vue'),
      },
      // Rest of the routes will be added here
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Auth Guard Simple
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  // Aquí se usaría el store de auth
  const token = localStorage.getItem('token'); 

  if (requiresAuth && !token) {
    next('/auth/login');
  } else if (to.path === '/auth/login' && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;

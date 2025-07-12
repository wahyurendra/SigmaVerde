import { useAuthStore } from '@/stores/auth';

// Route guard for authentication
export const requireAuth = (to, from, next) => {
    const authStore = useAuthStore();
    console.log('Checking authentication...');
    console.log('AuthStore:', authStore);
    if (!authStore.isAuthenticated) {
        next('/auth/login');
        console.log("User is not authenticated. Redirecting to login.");
    } else {
        next();
    }
};

// Route guard for specific roles
export const requireRole = (allowedRoles) => {
    return (to, from, next) => {
        const authStore = useAuthStore();
        
        if (!authStore.isAuthenticated) {
            next('/auth/login');
            return;
        }
        
        if (authStore.hasAnyRole(allowedRoles)) {
            next();
        } else {
            next('/auth/access'); // Access denied page
        }
    };
};

// Route guard for specific permissions
export const requirePermission = (requiredPermissions) => {
    return (to, from, next) => {
        const authStore = useAuthStore();
        
        if (!authStore.isAuthenticated) {
            next('/auth/login');
            return;
        }
        
        if (authStore.hasAllPermissions(requiredPermissions)) {
            next();
        } else {
            next('/auth/access'); // Access denied page
        }
    };
};

// Route guard for any of the specified permissions
export const requireAnyPermission = (permissions) => {
    return (to, from, next) => {
        const authStore = useAuthStore();
        
        if (!authStore.isAuthenticated) {
            next('/auth/login');
            return;
        }
        
        if (authStore.hasAnyPermission(permissions)) {
            next();
        } else {
            next('/auth/access'); // Access denied page
        }
    };
};

// Combined role and permission guard
export const requireRoleOrPermission = (allowedRoles, requiredPermissions) => {
    return (to, from, next) => {
        const authStore = useAuthStore();
        
        if (!authStore.isAuthenticated) {
            next('/auth/login');
            return;
        }
        
        const hasRole = authStore.hasAnyRole(allowedRoles);
        const hasPermission = authStore.hasAnyPermission(requiredPermissions);
        
        if (hasRole || hasPermission) {
            next();
        } else {
            next('/auth/access');
        }
    };
};

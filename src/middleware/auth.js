import { useAuthStore } from '@/stores/auth';

// Route guard for authentication
export const requireAuth = (to, from, next) => {
    const authStore = useAuthStore();
    
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Route:', to.path);
    console.log('Store instance:', authStore);
    console.log('isAuthenticated:', authStore.isAuthenticated);
    console.log('token:', authStore.token ? 'Present' : 'Missing');
    console.log('user:', authStore.user);
    console.log('================================');
    
    if (!authStore.isAuthenticated) {
        console.log("User is not authenticated. Redirecting to login.");
        next('/auth/login');
    } else {
        console.log("User is authenticated. Proceeding to route.");
        next();
    }
};

// Route guard for specific roles
export const requireRole = (allowedRoles) => {
    return (to, from, next) => {
        const authStore = useAuthStore();
        
        console.log('=== ROLE MIDDLEWARE DEBUG ===');
        console.log('Required roles:', allowedRoles);
        console.log('User role:', authStore.role);
        console.log('isAuthenticated:', authStore.isAuthenticated);
        
        if (!authStore.isAuthenticated) {
            console.log("User not authenticated, redirecting to login");
            next('/auth/login');
            return;
        }
        
        if (authStore.hasAnyRole(allowedRoles)) {
            console.log("User has required role, proceeding");
            next();
        } else {
            console.log("User lacks required role, redirecting to access denied");
            next('/auth/access'); // Access denied page
        }
    };
};

// Route guard for specific permissions
export const requirePermission = (requiredPermissions) => {
    return (to, from, next) => {
        const authStore = useAuthStore();
        
        console.log('=== PERMISSION MIDDLEWARE DEBUG ===');
        console.log('Required permissions:', requiredPermissions);
        console.log('User permissions:', authStore.permissions);
        console.log('isAuthenticated:', authStore.isAuthenticated);
        
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

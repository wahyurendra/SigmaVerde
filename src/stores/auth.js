import apiService from '@/services/api';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        permissions: [],
        role: null,
    }),

    getters: {
        isAdmin: (state) => state.role === 'admin',
        isL1Analyst: (state) => state.role === 'l1_analyst',
        isL2Analyst: (state) => state.role === 'l2_analyst',
        hasPermission: (state) => (permission) => state.permissions.includes(permission),
        canRead: (state) => state.permissions.includes('read'),
        canWrite: (state) => state.permissions.includes('write'),
        canApprove: (state) => state.permissions.includes('approve'),
        canManageUsers: (state) => state.permissions.includes('manage_users'),
        userInitials: (state) => {
            if (!state.user?.name) return '';
            return state.user.name
                .split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('')
                .substring(0, 2);
        },
    },

    actions: {
        async login(credentials) {
            try {
                this.loading = true;
                this.error = null;

                // Call API login endpoint
                const response = await apiService.login(credentials);
                
                // Check if login was successful
                if (!response.success) {
                    throw new Error('Login failed');
                }

                // Extract user data from response
                const { token, user } = response;
                
                // Store user data
                this.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email || `${user.username}@example.com`, // fallback if no email
                    name: user.name || user.username,
                    ...user
                };
                
                this.token = token;
                this.role = user.role;
                this.permissions = user.permissions || [];
                this.isAuthenticated = true;

                // Store in localStorage for persistence
                localStorage.setItem('auth_token', token);
                localStorage.setItem('auth_user', JSON.stringify(this.user));
                localStorage.setItem('auth_role', user.role);
                localStorage.setItem('auth_permissions', JSON.stringify(this.permissions));

                // Store in sessionStorage as backup
                sessionStorage.setItem('auth_token', token);
                sessionStorage.setItem('auth_user', JSON.stringify(this.user));

                console.log('User logged in successfully:', this.user);
                
                return { success: true };
            } catch (error) {
                this.error = error.message;
                console.error('Login error in store:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                this.loading = true;
                
                // Call API logout if token exists
                if (this.token) {
                    try {
                        await apiService.logout();
                    } catch (error) {
                        console.warn('API logout failed:', error);
                        // Continue with local logout even if API call fails
                    }
                }

                // Clear state
                this.user = null;
                this.token = null;
                this.role = null;
                this.permissions = [];
                this.isAuthenticated = false;
                this.error = null;

                // Clear storage
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_role');
                localStorage.removeItem('auth_permissions');
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_user');

                console.log('User logged out successfully');
                
                return { success: true };
            } catch (error) {
                this.error = error.message;
                console.error('Logout error:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async refreshToken() {
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await apiService.refreshToken(refreshToken);
                
                this.token = response.token || response.access_token;
                localStorage.setItem('auth_token', this.token);
                sessionStorage.setItem('auth_token', this.token);

                if (response.refresh_token) {
                    localStorage.setItem('refresh_token', response.refresh_token);
                }

                return { success: true };
            } catch (error) {
                console.error('Token refresh failed:', error);
                await this.logout();
                throw error;
            }
        },

        async loadUserFromStorage() {
            try {
                const token = localStorage.getItem('auth_token');
                const userStr = localStorage.getItem('auth_user');
                const role = localStorage.getItem('auth_role');
                const permissionsStr = localStorage.getItem('auth_permissions');

                if (token && userStr) {
                    this.token = token;
                    this.user = JSON.parse(userStr);
                    this.role = role;
                    this.permissions = permissionsStr ? JSON.parse(permissionsStr) : [];
                    this.isAuthenticated = true;

                    // Verify token is still valid by calling profile endpoint
                    try {
                        const profile = await apiService.getProfile();
                        // Update user data with fresh profile data
                        this.user = { ...this.user, ...profile };
                        localStorage.setItem('auth_user', JSON.stringify(this.user));
                    } catch (error) {
                        console.warn('Token validation failed:', error);
                        // Token might be expired, try to refresh
                        if (error.message.includes('401') || error.message.includes('403')) {
                            try {
                                await this.refreshToken();
                            } catch (refreshError) {
                                console.error('Token refresh failed:', refreshError);
                                await this.logout();
                                return { success: false, error: 'Session expired' };
                            }
                        }
                    }

                    console.log('User loaded from storage:', this.user);
                    return { success: true };
                }
                
                return { success: false, error: 'No stored session found' };
            } catch (error) {
                console.error('Error loading user from storage:', error);
                await this.logout();
                return { success: false, error: error.message };
            }
        },

        async updateProfile(profileData) {
            try {
                this.loading = true;
                
                // Call API to update profile
                const updatedUser = await apiService.updateProfile(profileData);
                
                // Update local state
                this.user = { ...this.user, ...updatedUser };
                localStorage.setItem('auth_user', JSON.stringify(this.user));
                sessionStorage.setItem('auth_user', JSON.stringify(this.user));

                return { success: true };
            } catch (error) {
                this.error = error.message;
                console.error('Profile update error:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        clearError() {
            this.error = null;
        },

        // Check if user has specific role
        hasRole(role) {
            return this.role === role;
        },

        // Check if user has any of the specified roles
        hasAnyRole(roles) {
            return roles.includes(this.role);
        },

        // Check if user has all specified permissions
        hasAllPermissions(permissions) {
            return permissions.every(permission => this.permissions.includes(permission));
        },

        // Check if user has any of the specified permissions
        hasAnyPermission(permissions) {
            return permissions.some(permission => this.permissions.includes(permission));
        }
    }
});

import { defineStore } from 'pinia'
import apiService from '@/services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      permissions: [],
      role: null,
      initialized: false,
    }),

    getters: {
      isAdmin: (state) => state.role === 'admin',
      isL1Analyst: (state) => state.role === 'L1',
      isL2Analyst: (state) => state.role === 'L2',
      isExchanger: (state) => state.role === 'Exchanger',
    
      hasPermission: (state) => (permission) => {
        return Array.isArray(state.permissions) && state.permissions.includes(permission)
      },
    
      canRead: (state) => state.permissions?.includes('read') ?? false,
      canWrite: (state) => state.permissions?.includes('write') ?? false,
      canApprove: (state) => state.permissions?.includes('approve') ?? false,
      canManageUsers: (state) => state.permissions?.includes('manage_users') ?? false,
    
      userInitials: (state) => {
        if (!state.user?.name) return ''
        return state.user.name
          .split(' ')
          .filter(word => word.length > 0)
          .map(word => word.charAt(0).toUpperCase())
          .join('')
          .substring(0, 2)
      },

      isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    },

    actions: {
      async initialize() {
        if (this.initialized) {
          return { success: true }
        }

        console.log('Initializing auth store...')
        
        try {
          const result = await this.loadUserFromStorage()
          this.initialized = true
          console.log('Auth store initialized:', result)
          return result
        } catch (error) {
          console.error('Failed to initialize auth store:', error)
          this.initialized = true
          return { success: false, error: error.message }
        }
      },

      async login(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password are required')
        }

        try {
          this.loading = true
          this.error = null

          console.log('Attempting login...')
          const response = await apiService.login(credentials)
        
          if (!response?.success || !response?.token) {
            throw new Error(response?.message || 'Login failed')
          }

          const { token, user, refresh_token } = response
        
          // Validate required user data
          if (!user?.id || !user?.username) {
            throw new Error('Invalid user data received')
          }

          console.log('Login API response received:', { user: user.username, hasToken: !!token })

          // Store user data with proper validation
          this.user = {
            id: user.id,
            username: user.username,
            email: user.email || `${user.username}@example.com`,
            name: user.name || user.username,
            avatar: user.avatar || null,
            ...user
          }
        
          this.token = token
          this.refreshToken = refresh_token || null
          this.role = user.role || null
          this.permissions = Array.isArray(user.permissions) ? user.permissions : []
          this.isAuthenticated = true

          console.log('Auth store state after login:')
          console.log('- isAuthenticated:', this.isAuthenticated)
          console.log('- user:', this.user.username)
          console.log('- role:', this.role)
          console.log('- permissions:', this.permissions)

          // Store in localStorage for persistence
          this._saveToStorage()

          console.log('User logged in successfully:', this.user.username)
        
          return { success: true, user: this.user }
        } catch (error) {
          this.error = error.message || 'Login failed'
          console.error('Login error:', error)
          throw error
        } finally {
          this.loading = false
        }
      },

      async logout() {
        try {
          this.loading = true
        
          // Call API logout if token exists
          if (this.token) {
            try {
              await apiService.logout()
            } catch (error) {
              console.warn('API logout failed:', error.message)
              // Continue with local logout even if API call fails
            }
          }

          // Clear state
          this._clearState()
        
          // Clear storage
          this._clearStorage()

          console.log('User logged out successfully')
        
          return { success: true }
        } catch (error) {
          this.error = error.message || 'Logout failed'
          console.error('Logout error:', error)
          // Still clear local state even if there's an error
          this._clearState()
          this._clearStorage()
          throw error
        } finally {
          this.loading = false
        }
      },

      async refreshToken() {
        if (!this.refreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await apiService.refreshToken(this.refreshToken)
        
          if (!response?.token) {
            throw new Error('Invalid refresh token response')
          }

          this.token = response.token
        
          if (response.refresh_token) {
            this.refreshToken = response.refresh_token
          }

          // Update storage
          this._saveToStorage()

          return { success: true }
        } catch (error) {
          console.error('Token refresh failed:', error)
          // If refresh fails, logout user
          await this.logout()
          throw error
        }
      },

      async loadUserFromStorage() {
        try {
          console.log('Loading user from storage...')
          const storedData = this._getFromStorage()
        
          if (!storedData.token || !storedData.user) {
            console.log('No stored session found')
            return { success: false, error: 'No stored session found' }
          }

          console.log('Found stored session for user:', storedData.user.username)

          // Restore state from storage
          this.token = storedData.token
          this.refreshToken = storedData.refreshToken
          this.user = storedData.user
          this.role = storedData.role
          this.permissions = Array.isArray(storedData.permissions) ? storedData.permissions : []
          this.isAuthenticated = true

          console.log('Auth state restored from storage:')
          console.log('- isAuthenticated:', this.isAuthenticated)
          console.log('- user:', this.user.username)
          console.log('- role:', this.role)

          // Verify token is still valid
          try {
            const profile = await apiService.getProfile()
            // Update user data with fresh profile data
            this.user = { ...this.user, ...profile }
            this._saveToStorage()
            console.log('Token validated successfully')
          } catch (error) {
            console.warn('Token validation failed:', error.message)
          
            // If token is expired, try to refresh
            if (this._isAuthError(error)) {
              try {
                await this.refreshToken()
                // Try to get profile again after refresh
                const profile = await apiService.getProfile()
                this.user = { ...this.user, ...profile }
                this._saveToStorage()
                console.log('Token refreshed successfully')
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
                await this.logout()
                return { success: false, error: 'Session expired' }
              }
            } else {
              // For other errors, still keep the user logged in
              console.warn('Profile fetch failed but token seems valid')
            }
          }

          console.log('User loaded from storage:', this.user.username)
          return { success: true }
        } catch (error) {
          console.error('Error loading user from storage:', error)
          await this.logout()
          return { success: false, error: error.message }
        }
      },

      async updateProfile(profileData) {
        if (!this.isAuthenticated) {
          throw new Error('User not authenticated')
        }

        try {
          this.loading = true
          this.error = null
        
          const updatedUser = await apiService.updateProfile(profileData)
        
          // Update local state
          this.user = { ...this.user, ...updatedUser }
          this._saveToStorage()

          return { success: true, user: this.user }
        } catch (error) {
          this.error = error.message || 'Profile update failed'
          console.error('Profile update error:', error)
          throw error
        } finally {
          this.loading = false
        }
      },

      // Utility methods
      clearError() {
        this.error = null
      },

      hasRole(role) {
        return this.role === role
      },

      hasAnyRole(roles) {
        return Array.isArray(roles) && roles.includes(this.role)
      },

      hasAllPermissions(permissions) {
        if (!Array.isArray(permissions) || !Array.isArray(this.permissions)) {
          return false
        }
        return permissions.every(permission => this.permissions.includes(permission))
      },

      hasAnyPermission(permissions) {
        if (!Array.isArray(permissions) || !Array.isArray(this.permissions)) {
          return false
        }
        return permissions.some(permission => this.permissions.includes(permission))
      },

      // Private helper methods
      _saveToStorage() {
        try {
          const dataToStore = {
            token: this.token,
            refreshToken: this.refreshToken,
            user: this.user,
            role: this.role,
            permissions: this.permissions
          }

          localStorage.setItem('auth_data', JSON.stringify(dataToStore))
          sessionStorage.setItem('auth_token', this.token)
          console.log('Auth data saved to storage')
        } catch (error) {
          console.error('Failed to save auth data to storage:', error)
        }
      },

      _getFromStorage() {
        try {
          const authData = localStorage.getItem('auth_data')
          if (authData) {
            const parsed = JSON.parse(authData)
            console.log('Loaded auth data from new storage format')
            return parsed
          }
        
          // Fallback to old storage format
          const token = localStorage.getItem('auth_token')
          const userStr = localStorage.getItem('auth_user')
          const role = localStorage.getItem('auth_role')
          const permissionsStr = localStorage.getItem('auth_permissions')
          const refreshToken = localStorage.getItem('refresh_token')

          if (token && userStr) {
            console.log('Loaded auth data from old storage format')
            return {
              token,
              refreshToken,
              user: JSON.parse(userStr),
              role,
              permissions: permissionsStr ? JSON.parse(permissionsStr) : []
            }
          }
        } catch (error) {
          console.error('Failed to load auth data from storage:', error)
        }
      
        return {}
      },

      _clearStorage() {
        try {
          // Clear new format
          localStorage.removeItem('auth_data')
        
          // Clear old format
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_role')
          localStorage.removeItem('auth_permissions')
          localStorage.removeItem('refresh_token')
        
          sessionStorage.removeItem('auth_token')
          sessionStorage.removeItem('auth_user')
        
          console.log('Auth data cleared from storage')
        } catch (error) {
          console.error('Failed to clear auth data from storage:', error)
        }
      },

      _clearState() {
        this.user = null
        this.token = null
        this.refreshToken = null
        this.role = null
        this.permissions = []
        this.isAuthenticated = false
        this.error = null
        console.log('Auth state cleared')
      },

      _isAuthError(error) {
        const message = error.message || ''
        const status = error.status || error.response?.status
        return status === 401 || status === 403 || 
               message.includes('401') || message.includes('403') ||
               message.includes('unauthorized') || message.includes('forbidden')
      }
    }
})

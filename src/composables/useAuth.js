import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

export function useAuth() {
  const authStore = useAuthStore()
  
  const hasRole = (roles) => {
    if (!Array.isArray(roles)) {
      roles = [roles]
    }
    return roles.includes(authStore.user?.role)
  }
  
  const canAccessRules = computed(() => {
    return hasRole(['admin', 'l2_analyst'])
  })
  
  return {
    hasRole,
    canAccessRules,
    user: computed(() => authStore.user),
    userRole: computed(() => authStore.user?.role)
  }
}
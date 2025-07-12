<script setup>
import { computed, ref } from 'vue'

// Enhanced data structure for regulatory updates
const updates = ref([
  {
    id: 1,
    title: 'New FATF Crypto Guidelines',
    description: 'Enhanced requirements for virtual asset service providers and DeFi protocols',
    timestamp: '2 hours ago',
    priority: 'high',
    status: 'new',
    category: 'FATF',
    impact: 'Global',
    color: 'emerald'
  },
  {
    id: 2,
    title: 'FinCEN Crypto Advisory',
    description: 'Updated guidance on cryptocurrency mixing and privacy coins',
    timestamp: '1 day ago',
    priority: 'critical',
    status: 'important',
    category: 'FinCEN',
    impact: 'US',
    color: 'amber'
  },
  {
    id: 3,
    title: 'EU MiCA Regulation',
    description: 'Markets in Crypto-Assets regulation implementation timeline',
    timestamp: '3 days ago',
    priority: 'medium',
    status: 'reviewed',
    category: 'EU',
    impact: 'Europe',
    color: 'blue'
  },
  {
    id: 4,
    title: 'CFTC Digital Assets',
    description: 'New enforcement actions against unregistered crypto derivatives',
    timestamp: '1 week ago',
    priority: 'medium',
    status: 'update',
    category: 'CFTC',
    impact: 'US',
    color: 'purple'
  }
])

const criticalUpdates = computed(() => 
  updates.value.filter(update => update.priority === 'critical').length
)

const getStatusBadgeClass = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase'
  
  switch (status) {
    case 'new':
      return `${baseClasses} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700`
    case 'important':
      return `${baseClasses} bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700`
    case 'reviewed':
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700`
    case 'update':
      return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-700`
  }
}

const getUpdateCardClass = (color) => {
  const baseClasses = 'group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5'
  
  switch (color) {
    case 'emerald':
      return `${baseClasses} bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700`
    case 'amber':
      return `${baseClasses} bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-200 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700`
    case 'blue':
      return `${baseClasses} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700`
    case 'purple':
      return `${baseClasses} bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-200 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700`
    default:
      return `${baseClasses} bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50 border-gray-200 dark:border-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700`
  }
}

const getPriorityIndicator = (priority) => {
  switch (priority) {
    case 'critical':
      return 'w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50'
    case 'high':
      return 'w-3 h-3 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50'
    case 'medium':
      return 'w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50'
    default:
      return 'w-3 h-3 bg-gray-400 rounded-full'
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
    <!-- Header Section -->
    <div class="relative bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="p-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div v-if="criticalUpdates > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span class="text-xs font-bold text-white">{{ criticalUpdates }}</span>
            </div>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Regulatory Intelligence
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Real-time compliance monitoring
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Live</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Updates Timeline -->
    <div class="p-6">
      <div class="space-y-4">
        <div 
          v-for="(update, index) in updates" 
          :key="update.id"
          class="relative"
        >
          <!-- Timeline connector -->
          <div 
            v-if="index < updates.length - 1"
            class="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600"
          ></div>
          
          <div class="flex gap-4">
            <!-- Priority indicator -->
            <div class="flex flex-col items-center pt-2">
              <div :class="getPriorityIndicator(update.priority)"></div>
            </div>
            
            <!-- Update card -->
            <div class="flex-1">
              <div :class="getUpdateCardClass(update.color)">
                <!-- Subtle background pattern -->
                <div class="absolute inset-0 opacity-5">
                  <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent transform rotate-45 translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                </div>
                
                <div class="relative p-5">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h4 class="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                          {{ update.title }}
                        </h4>
                        <span :class="getStatusBadgeClass(update.status)">
                          {{ update.status }}
                        </span>
                      </div>
                      
                      <div class="flex items-center gap-4 mb-3">
                        <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {{ update.category }}
                        </span>
                        <span class="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"></path>
                          </svg>
                          {{ update.impact }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {{ update.description }}
                  </p>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {{ update.timestamp }}
                    </div>
                    
                    <button class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group/btn">
                      <span>View Details</span>
                      <svg class="w-3 h-3 transform group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh Updates
          </button>
          <button class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Configure Alerts
          </button>
        </div>
        
        <button class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
          <span>View All Updates</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Quick Stats Bar -->
    <div class="px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-t border-emerald-200 dark:border-emerald-800/50">
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <span class="text-gray-600 dark:text-gray-400">
              {{ updates.filter(u => u.priority === 'critical').length }} Critical
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span class="text-gray-600 dark:text-gray-400">
              {{ updates.filter(u => u.priority === 'high').length }} High Priority
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-gray-600 dark:text-gray-400">
              {{ updates.filter(u => u.priority === 'medium').length }} Medium
            </span>
          </div>
        </div>
        
        <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="font-medium">System Monitoring Active</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations for enhanced UX */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.group:hover .group-hover\:animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth gradient transitions */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Enhanced shadow effects */
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dark .shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar for better aesthetics */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}

/* Micro-interactions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced focus states for accessibility */
button:focus-visible {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: 2px;
}

.dark button:focus-visible {
  outline-color: theme('colors.emerald.400');
}

/* Subtle text selection styling */
::selection {
  background-color: theme('colors.emerald.100');
  color: theme('colors.emerald.900');
}

.dark ::selection {
  background-color: theme('colors.emerald.900');
  color: theme('colors.emerald.100');
}
</style>

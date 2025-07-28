<script setup>
import { useAuthStore } from '@/stores/auth';
import { useCaseStore } from '@/stores/cases';
import { amlCaseService } from '@/services/AMLCaseService';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const caseStore = useCaseStore();
const authStore = useAuthStore();
const router = useRouter();

// Reactive state
const loading = ref(false);
const cases = ref([]);

// Fetch recent cases
const fetchRecentCases = async () => {
    loading.value = true;
    try {
        const anomalies = await amlCaseService.getAnomalies();
        // Get only the 10 most recent cases
        cases.value = anomalies
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching recent cases:', error);
        // Fallback to store data if API fails
        cases.value = caseStore.recentCases.slice(0, 10);
    } finally {
        loading.value = false;
    }
};

const filteredCases = computed(() => {
    // Filter cases based on user role
    return cases.value.filter(case_ => {
        if (authStore.isAdmin) {
            return true; // Admin sees all cases
        } else if (authStore.isL2Analyst) {
            return case_.level === 'L2'; // L2 analyst only sees L2 cases
        } else if (authStore.isL1Analyst) {
            return case_.level === 'L1'; // L1 analyst only sees L1 cases
        }
        return false;
    });
});

const viewCase = (caseId) => {
    router.push(`/monitoring/detail/${caseId}`);
};

const escalateCase = async (case_) => {
    try {
        const updatedCase = {
            ...case_,
            level: 'L2',
            status: 'escalated',
            activities: [
                ...case_.activities || [],
                {
                    timestamp: new Date(),
                    action: 'Case Escalated to L2',
                    user: authStore.user?.name || authStore.currentUser?.email || 'Current User',
                    comment: 'Escalated for further review'
                }
            ]
        };

        // Update via API service
        await amlCaseService.updateCase(case_.id, updatedCase);
        
        // Update local case
        const index = cases.value.findIndex(c => c.id === case_.id);
        if (index !== -1) {
            cases.value[index] = updatedCase;
        }
        
        // Also update store if available
        if (caseStore.updateCase) {
            caseStore.updateCase(case_.id, updatedCase);
        }
        
        console.log(`Case ${case_.id} escalated to L2`);
    } catch (error) {
        console.error('Error escalating case:', error);
    }
};

const approveCase = async (case_) => {
    try {
        const updatedCase = {
            ...case_,
            status: 'approved',
            activities: [
                ...case_.activities || [],
                {
                    timestamp: new Date(),
                    action: 'Case Approved',
                    user: authStore.user?.name || authStore.currentUser?.email || 'Current User',
                    comment: 'Case approved and resolved'
                }
            ]
        };

        // Update via API service
        await amlCaseService.updateCase(case_.id, updatedCase);
        
        // Update local case
        const index = cases.value.findIndex(c => c.id === case_.id);
        if (index !== -1) {
            cases.value[index] = updatedCase;
        }
        
        // Also update store if available
        if (caseStore.updateCase) {
            caseStore.updateCase(case_.id, updatedCase);
        }
        
        console.log(`Case ${case_.id} approved`);
    } catch (error) {
        console.error('Error approving case:', error);
    }
};

const canEscalate = (case_) => {
    const hasPermission = authStore.isL1Analyst || authStore.isAdmin;
    return hasPermission && 
           case_.level === 'L1' && 
           case_.status !== 'approved' && 
           case_.status !== 'rejected';
};

const canApprove = (case_) => {
    const hasPermission = authStore.hasPermission('approve');
    return hasPermission && 
           case_.status !== 'approved' && 
           case_.status !== 'rejected';
};

// Utility functions to match CaseManagement.vue
const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const getStatusLabel = (status) => {
    const statusLabels = {
        'new': 'New',
        'in_review': 'In Review',
        'pending_docs': 'Pending Documents',
        'escalated': 'Escalated',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'Under Review': 'Under Review',
        'Pending': 'Pending',
        'Resolved': 'Resolved',
        'Investigating': 'Investigating'
    };
    return statusLabels[status] || status;
};

const formatWalletAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Lifecycle
onMounted(() => {
    fetchRecentCases();
    
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
        if (!loading.value) {
            fetchRecentCases();
        }
    }, 30000);
    
    // Cleanup on unmount
    return () => {
        clearInterval(refreshInterval);
    };
});
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Recent Crypto AML Cases</h3>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="fetchRecentCases"
          :disabled="loading"
          class="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded-md transition-colors"
          :class="{ 'animate-spin': loading }"
          title="Refresh">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
        <button 
          @click="router.push('/monitoring/cases')"
          class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold flex items-center gap-1">
          View All Cases
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600 dark:text-gray-400">Loading cases...</span>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="filteredCases.length === 0" class="text-center py-8">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
      <p class="text-gray-600 dark:text-gray-400">No recent cases found</p>
    </div>
    
    <!-- Cases Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-gray-200 dark:border-gray-700">
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Case ID</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Wallet/Entity</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Crypto</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Amount</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Priority</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Status</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Date</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="case_ in filteredCases" :key="case_.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td class="py-4">
              <span class="text-sm font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" 
                    @click="viewCase(case_.id)">
                {{ case_.id }}
              </span>
            </td>
            <td class="py-4">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900 dark:text-white font-mono">
                  {{ case_.wallet ? formatWalletAddress(case_.wallet) : (case_.customer || 'N/A') }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ case_.wallet ? 'Wallet' : (case_.customer?.includes('Wallet') ? 'Individual' : 'Exchange') }}
                </span>
              </div>
            </td>
            <td class="py-4">
              <div 
                class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold"
                :class="{
                  'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300': case_.crypto === 'BTC',
                  'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300': case_.crypto === 'ETH',
                  'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300': case_.crypto === 'USDT' || case_.crypto === 'USDC',
                  'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300': !['BTC', 'ETH', 'USDT', 'USDC'].includes(case_.crypto)
                }"
              >
                <div 
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-orange-500': case_.crypto === 'BTC',
                    'bg-blue-500': case_.crypto === 'ETH',
                    'bg-green-500': case_.crypto === 'USDT' || case_.crypto === 'USDC',
                    'bg-gray-500': !['BTC', 'ETH', 'USDT', 'USDC'].includes(case_.crypto)
                  }"
                ></div>
                {{ case_.crypto }}
              </div>
            </td>
            <td class="py-4">
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ case_.amount }}</span>
            </td>
            <td class="py-4">
              <span 
                class="inline-flex px-3 py-1 text-xs font-bold rounded-full"
                :class="{
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300': (case_.priority || case_.riskLevel) === 'high' || (case_.priority || case_.riskLevel) === 'High',
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300': (case_.priority || case_.riskLevel) === 'medium' || (case_.priority || case_.riskLevel) === 'Medium',
                  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': (case_.priority || case_.riskLevel) === 'low' || (case_.priority || case_.riskLevel) === 'Low'
                }"
              >
                {{ case_.priority || case_.riskLevel || 'Medium' }}
              </span>
            </td>
            <td class="py-4">
              <span 
                class="inline-flex px-3 py-1 text-xs font-bold rounded-full"
                :class="{
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300': case_.status === 'new',
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300': case_.status === 'in_review' || case_.status === 'Under Review' || case_.status === 'Pending' || case_.status === 'pending_docs',
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300': case_.status === 'escalated',
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300': case_.status === 'Investigating',
                  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': case_.status === 'approved' || case_.status === 'Resolved',
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300': case_.status === 'rejected'
                }"
              >
                {{ getStatusLabel(case_.status) }}
              </span>
            </td>
            <td class="py-4">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(case_.createdAt || case_.date) }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ case_.createdAt ? new Date(case_.createdAt).toLocaleTimeString() : '' }}
                </span>
              </div>
            </td>
            <td class="py-4">
              <div class="flex items-center gap-2">
                <button 
                  @click="viewCase(case_.id)"
                  class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                  v-tooltip.top="'View Details'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button 
                  v-if="canEscalate(case_)"
                  @click="escalateCase(case_)"
                  class="p-1 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-md transition-colors"
                  v-tooltip.top="'Escalate to L2'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </button>
                <button 
                  v-if="canApprove(case_)"
                  @click="approveCase(case_)"
                  class="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md transition-colors"
                  v-tooltip.top="'Approve Case'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Table styling improvements */
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}

/* Hover effects */
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  text-decoration: underline;
}

/* Responsive table */
@media (max-width: 768px) {
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }
  
  table {
    min-width: 800px;
  }
  
  th, td {
    padding: 0.75rem 0.5rem;
  }
  
  .text-xs {
    font-size: 0.7rem;
  }
  
  .text-sm {
    font-size: 0.8rem;
  }
}

/* Dark mode improvements */
@media (prefers-color-scheme: dark) {
  .bg-white {
    background-color: rgb(31 41 55);
  }
  
  .border-gray-200 {
    border-color: rgb(55 65 81);
  }
  
  .text-gray-900 {
    color: rgb(243 244 246);
  }
  
  .text-gray-600 {
    color: rgb(156 163 175);
  }
}

/* Status badge animations */
.inline-flex {
  transition: all 0.2s ease-in-out;
}

.inline-flex:hover {
  transform: scale(1.05);
}

/* Action button improvements */
button {
  transition: all 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Loading state */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.dark .loading-overlay {
  background: rgba(31, 41, 55, 0.8);
}
</style>
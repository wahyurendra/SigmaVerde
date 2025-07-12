<script setup>
import { useAuthStore } from '@/stores/auth';
import { useCaseStore } from '@/stores/cases';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const caseStore = useCaseStore();
const authStore = useAuthStore();
const router = useRouter();

const filteredCases = computed(() => {
    // Filter cases based on user role
    return caseStore.recentCases.filter(case_ => {
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
    router.push(`/monitoring/cases/${caseId}`);
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
                    user: authStore.currentUser?.email || 'Current User',
                    comment: 'Escalated for further review'
                }
            ]
        };

        caseStore.updateCase(case_.id, updatedCase);
        console.log(`Case ${case_.id} escalated to L2`);
    } catch (error) {
        console.error('Error escalating case:', error);
    }
};

const approveCase = async (case_) => {
    try {
        const updatedCase = {
            ...case_,
            status: 'Resolved',
            activities: [
                ...case_.activities || [],
                {
                    timestamp: new Date(),
                    action: 'Case Approved',
                    user: authStore.currentUser?.email || 'Current User',
                    comment: 'Case approved and resolved'
                }
            ]
        };

        caseStore.updateCase(case_.id, updatedCase);
        console.log(`Case ${case_.id} approved`);
    } catch (error) {
        console.error('Error approving case:', error);
    }
};

const canEscalate = (case_) => {
    return (authStore.isL1Analyst || authStore.isAdmin) && 
           case_.level === 'L1' && 
           case_.status !== 'Resolved';
};

const canApprove = (case_) => {
    return authStore.hasPermission('approve') && 
           case_.status !== 'Resolved';
};
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
      <button 
        @click="router.push('/monitoring/cases')"
        class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold flex items-center gap-1">
        View All Cases
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-gray-200 dark:border-gray-700">
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Case ID</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Wallet/Entity</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Crypto</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Amount</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Risk</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Status</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Date</th>
            <th class="text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-4">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="case_ in filteredCases" :key="case_.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td class="py-4">
              <span class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ case_.id }}</span>
            </td>
            <td class="py-4">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ case_.customer }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ case_.customer.includes('Wallet') ? 'Individual' : 'Exchange' }}</span>
              </div>
            </td>
            <td class="py-4">
              <div 
                class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold"
                :class="{
                  'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300': case_.crypto === 'BTC',
                  'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300': case_.crypto === 'ETH'
                }"
              >
                <div 
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-orange-500': case_.crypto === 'BTC',
                    'bg-blue-500': case_.crypto === 'ETH'
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
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300': case_.riskLevel === 'High',
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300': case_.riskLevel === 'Medium',
                  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': case_.riskLevel === 'Low'
                }"
              >
                {{ case_.riskLevel }}
              </span>
            </td>
            <td class="py-4">
              <span 
                class="inline-flex px-3 py-1 text-xs font-bold rounded-full"
                :class="{
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300': case_.status === 'Under Review' || case_.status === 'Pending',
                  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': case_.status === 'Resolved',
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300': case_.status === 'Investigating'
                }"
              >
                {{ case_.status }}
              </span>
            </td>
            <td class="py-4">
              <span class="text-sm text-gray-600 dark:text-gray-300">{{ case_.date }}</span>
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
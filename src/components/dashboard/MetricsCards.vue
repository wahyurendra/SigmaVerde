<script setup>
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  cryptoMetrics: {
    type: Object,
    required: true
  },
  selectedTimeframe: {
    type: String,
    default: '24h'
  }
})

const emit = defineEmits(['update:selectedTimeframe'])

const updateTimeframe = (value) => {
  emit('update:selectedTimeframe', value)
}
</script>

<template>
  <div class="mb-8">
    <!-- Main Container with SigmaVerde styling -->
    <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200/30 dark:border-emerald-800/30 p-8 relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-teal-50/30 dark:from-emerald-950/20 dark:via-transparent dark:to-teal-950/10"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-emerald-200/20 via-transparent to-transparent dark:from-emerald-800/10 rounded-full -translate-y-48 translate-x-48"></div>
      
      <!-- Header Section -->
      <div class="relative z-10 flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Cryptocurrency AML Metrics
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Real-time compliance monitoring</p>
          </div>
        </div>
        
        <!-- Enhanced Timeframe Selector -->
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Timeframe:</span>
          <div class="relative">
            <select 
              :value="selectedTimeframe"
              @change="updateTimeframe($event.target.value)"
              class="appearance-none bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <!-- Suspicious Transactions Card -->
        <div class="group relative overflow-hidden bg-gradient-to-br from-red-50/80 via-rose-50/60 to-red-100/80 dark:from-red-950/40 dark:via-red-900/30 dark:to-red-800/40 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50 dark:border-red-800/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <!-- Card Background Effects -->
          <div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/10 dark:from-red-400/10 dark:to-rose-400/5"></div>
          <div class="absolute -top-4 -right-4 w-24 h-24 bg-red-200/20 dark:bg-red-800/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
          
          <div class="relative z-10 flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p class="text-red-700 dark:text-red-300 text-sm font-semibold">Suspicious Transactions</p>
              </div>
              <p class="text-4xl font-bold text-red-900 dark:text-red-100 mb-4">{{ cryptoMetrics.suspiciousTransactions.count }}</p>
              
              <!-- Crypto Breakdown -->
              <div class="flex items-center gap-4 mb-4">
                <div class="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                  <div class="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">BTC: {{ cryptoMetrics.suspiciousTransactions.btc }}</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                  <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">ETH: {{ cryptoMetrics.suspiciousTransactions.eth }}</span>
                </div>
              </div>
              
              <!-- Change Indicator -->
              <div class="flex items-center gap-2 px-3 py-1.5 bg-red-100/80 dark:bg-red-900/40 rounded-lg">
                <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-red-700 dark:text-red-300 text-xs font-semibold">+{{ cryptoMetrics.suspiciousTransactions.change }}% from yesterday</span>
              </div>
            </div>
            
            <!-- Icon Container -->
            <div class="bg-gradient-to-br from-red-500 to-rose-600 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- High Risk Addresses Card -->
        <div class="group relative overflow-hidden bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-amber-100/80 dark:from-amber-950/40 dark:via-orange-900/30 dark:to-amber-800/40 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 dark:border-amber-800/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <!-- Card Background Effects -->
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/10 dark:from-amber-400/10 dark:to-orange-400/5"></div>
          <div class="absolute -top-4 -right-4 w-24 h-24 bg-amber-200/20 dark:bg-amber-800/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
          
          <div class="relative z-10 flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p class="text-amber-700 dark:text-amber-300 text-sm font-semibold">High Risk Addresses</p>
              </div>
              <p class="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-4">{{ cryptoMetrics.highRiskAddresses.count }}</p>
              
              <!-- Crypto Breakdown -->
              <div class="flex items-center gap-4 mb-4">
                <div class="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                  <div class="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">BTC: {{ cryptoMetrics.highRiskAddresses.btc }}</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                  <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">ETH: {{ cryptoMetrics.highRiskAddresses.eth }}</span>
                </div>
              </div>
              
              <!-- Change Indicator -->
              <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-100/80 dark:bg-emerald-900/40 rounded-lg">
                <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-emerald-700 dark:text-emerald-300 text-xs font-semibold">-{{ Math.abs(cryptoMetrics.highRiskAddresses.change) }}% from yesterday</span>
              </div>
            </div>
            
            <!-- Icon Container -->
            <div class="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Compliance Score Card -->
        <div class="group relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-emerald-100/80 dark:from-emerald-950/40 dark:via-green-900/30 dark:to-emerald-800/40 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <!-- Card Background Effects -->
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/10 dark:from-emerald-400/10 dark:to-green-400/5"></div>
          <div class="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
          
          <div class="relative z-10 flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <p class="text-emerald-700 dark:text-emerald-300 text-sm font-semibold">Compliance Score</p>
              </div>
              <p class="text-4xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">{{ cryptoMetrics.complianceScore.score }}%</p>
              
              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="w-full bg-emerald-200/50 dark:bg-emerald-800/30 rounded-full h-3 overflow-hidden">
                  <div 
                    class="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    :style="`width: ${cryptoMetrics.complianceScore.score}%`"
                  ></div>
                </div>
                <div class="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <!-- Change Indicator -->
              <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-100/80 dark:bg-emerald-900/40 rounded-lg">
                <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-emerald-700 dark:text-emerald-300 text-xs font-semibold">+{{ cryptoMetrics.complianceScore.change }}% from last week</span>
              </div>
            </div>
            
            <!-- Icon Container -->
            <div class="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Active Cases Card -->
        <div class="group relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-cyan-50/60 to-blue-100/80 dark:from-blue-950/40 dark:via-cyan-900/30 dark:to-blue-800/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <!-- Card Background Effects -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 dark:from-blue-400/10 dark:to-cyan-400/5"></div>
          <div class="absolute -top-4 -right-4 w-24 h-24 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
          
          <div class="relative z-10 flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p class="text-blue-700 dark:text-blue-300 text-sm font-semibold">Active Cases</p>
              </div>
              <p class="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-4">{{ cryptoMetrics.activeCases.count }}</p>
              
              <!-- Crypto Breakdown -->
              <div class="flex items-center gap-4 mb-4">
                <div class="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                  <div class="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">BTC: {{ cryptoMetrics.activeCases.btc }}</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                  <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">ETH: {{ cryptoMetrics.activeCases.eth }}</span>
                </div>
              </div>
              
              <!-- Urgent Cases Indicator -->
              <div class="flex items-center gap-2 px-3 py-1.5 bg-red-100/80 dark:bg-red-900/40 rounded-lg">
                <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span class="text-red-700 dark:text-red-300 text-xs font-semibold">{{ cryptoMetrics.activeCases.urgent }} require immediate attention</span>
              </div>
            </div>
            
            <!-- Icon Container -->
            <div class="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Stats Bar -->
      <div class="relative z-10 mt-8 pt-6 border-t border-emerald-200/30 dark:border-emerald-800/30">
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span class="text-slate-600 dark:text-slate-400">System Status: </span>
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Operational</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-slate-600 dark:text-slate-400">Last updated: </span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">{{ new Date().toLocaleTimeString() }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 bg-emerald-100/60 dark:bg-emerald-900/30 rounded-lg">
            <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="text-emerald-700 dark:text-emerald-300 text-xs font-medium">Auto-refresh enabled</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-stops));
}

.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Custom scrollbar for select dropdown */
select::-webkit-scrollbar {
  width: 8px;
}

select::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

select::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.5);
  border-radius: 4px;
}

select::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.7);
}

/* Enhanced focus states */
.group:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Smooth animations */
* {
  transition-property: transform, box-shadow, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

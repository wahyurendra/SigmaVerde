<script setup>
import SankeyChart from '@/components/SankeyChart.vue';
import AlertsPanel from '@/components/dashboard/AlertsPanel.vue';
import ComplianceStatus from '@/components/dashboard/ComplianceStatus.vue';
import MetricsCards from '@/components/dashboard/MetricsCards.vue';
import NotificationAlert from '@/components/dashboard/NotificationAlert.vue';
import QuickActionsFAB from '@/components/dashboard/QuickActionsFAB.vue';
import RecentCasesTable from '@/components/dashboard/RecentCasesTable.vue';
import RegulatoryUpdates from '@/components/dashboard/RegulatoryUpdates.vue';
import { useLayout } from '@/layout/composables/layout';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const { isDarkTheme } = useLayout()

watch(isDarkTheme, (newVal) => {
    localStorage.setItem('darkMode', isDarkTheme)
    if(isDarkTheme.value){
        document.documentElement.classList.add('dark')
        localStorage.setItem('darkMode', isDarkTheme)
    }else{
        document.documentElement.classList.remove('dark')
    }
})

const toast = useToast()
const router = useRouter()

// Reactive data
const selectedTimeframe = ref('24h')
const isLoading = ref(false)
const lastUpdate = ref(new Date())
const showQuickActions = ref(false) 

// Mock data for crypto AML tracking
const cryptoMetrics = ref({
  suspiciousTransactions: {
    count: 247,
    change: 12,
    trend: 'up',
    btc: 156,
    eth: 91
  },
  highRiskAddresses: {
    count: 89,
    change: -3,
    trend: 'down',
    btc: 52,
    eth: 37
  },
  complianceScore: {
    score: 94.2,
    change: 2.1,
    trend: 'up'
  },
  activeCases: {
    count: 156,
    urgent: 23,
    btc: 89,
    eth: 67
  }
})

// Enhanced alerts data with more comprehensive information
const alerts = ref([
  {
    id: 1,
    type: 'critical',
    title: 'Large BTC mixing service detected',
    description: 'Address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa involved in tumbling operations with multiple privacy coins',
    time: '2 min ago',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    crypto: 'BTC',
    amount: '45.7 BTC (~$1,890,000)',
    severity: 92,
    read: false,
    source: 'Blockchain Analysis',
    riskScore: 9.2,
    affectedWallets: 15,
    transactionHash: '1a2b3c4d5e6f7g8h9i0j...',
    tags: ['mixing', 'privacy-coins', 'high-volume']
  },
  {
    id: 2,
    type: 'high',
    title: 'ETH privacy coin conversion',
    description: 'Suspicious ETH to Monero exchange pattern detected across multiple DEX platforms',
    time: '15 min ago',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    crypto: 'ETH',
    amount: '234.5 ETH (~$562,800)',
    severity: 78,
    read: false,
    source: 'DEX Monitor',
    riskScore: 7.8,
    affectedWallets: 8,
    transactionHash: '0x9f8e7d6c5b4a3928...',
    tags: ['privacy-conversion', 'dex', 'cross-chain']
  },
  {
    id: 3,
    type: 'medium',
    title: 'Rapid transaction structuring',
    description: 'Multiple small BTC transactions below reporting threshold detected from single source',
    time: '1 hour ago',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    crypto: 'BTC',
    amount: '12.3 BTC (~$508,000)',
    severity: 45,
    read: true,
    source: 'Pattern Analysis',
    riskScore: 4.5,
    affectedWallets: 23,
    transactionHash: '3c4d5e6f7g8h9i0j1k2l...',
    tags: ['structuring', 'threshold-avoidance', 'multiple-outputs']
  },
  {
    id: 4,
    type: 'critical',
    title: 'Sanctioned entity interaction',
    description: 'Direct transaction detected with OFAC sanctioned cryptocurrency address',
    time: '2 hours ago',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    crypto: 'ETH',
    amount: '89.2 ETH (~$214,080)',
    severity: 95,
    read: false,
    source: 'Sanctions Screening',
    riskScore: 9.5,
    affectedWallets: 3,
    transactionHash: '0x4d5e6f7g8h9i0j1k2l3m...',
    tags: ['sanctions', 'ofac', 'prohibited-entity']
  },
  {
    id: 5,
    type: 'high',
    title: 'Darknet marketplace funding',
    description: 'Wallet linked to known darknet marketplace receiving significant cryptocurrency deposits',
    time: '3 hours ago',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    crypto: 'ADA',
    amount: '50,000 ADA (~$25,000)',
    severity: 82,
    read: false,
    source: 'Darknet Intelligence',
    riskScore: 8.2,
    affectedWallets: 12,
    transactionHash: 'addr1q9f8e7d6c5b4a3928...',
    tags: ['darknet', 'marketplace', 'illicit-funding']
  },
  {
    id: 6,
    type: 'medium',
    title: 'Unusual cross-border activity',
    description: 'High-frequency transactions between jurisdictions with different AML requirements',
    time: '4 hours ago',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    crypto: 'DOT',
    amount: '2,500 DOT (~$15,300)',
    severity: 38,
    read: true,
    source: 'Geographic Analysis',
    riskScore: 3.8,
    affectedWallets: 7,
    transactionHash: '5e6f7g8h9i0j1k2l3m4n...',
    tags: ['cross-border', 'jurisdiction-shopping', 'regulatory-arbitrage']
  },
  {
    id: 7,
    type: 'critical',
    title: 'Smart contract exploit detected',
    description: 'Potential flash loan attack targeting DeFi protocol with significant fund drainage',
    time: '5 hours ago',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    crypto: 'ETH',
    amount: '156.8 ETH (~$376,320)',
    severity: 88,
    read: false,
    source: 'DeFi Security Monitor',
    riskScore: 8.8,
    affectedWallets: 1,
    transactionHash: '0x6f7g8h9i0j1k2l3m4n5o...',
    tags: ['defi-exploit', 'flash-loan', 'smart-contract']
  },
  {
    id: 8,
    type: 'high',
    title: 'Ransomware payment detected',
    description: 'Transaction pattern consistent with ransomware payment to known criminal organization',
    time: '6 hours ago',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    crypto: 'BTC',
    amount: '5.2 BTC (~$215,000)',
    severity: 85,
    read: true,
    source: 'Threat Intelligence',
    riskScore: 8.5,
    affectedWallets: 2,
    transactionHash: '7g8h9i0j1k2l3m4n5o6p...',
    tags: ['ransomware', 'criminal-organization', 'extortion']
  }
])

const recentCases = ref([
  {
    id: 'AML-BTC-001',
    customer: 'Wallet: 1A1zP1eP...',
    crypto: 'BTC',
    riskLevel: 'High',
    status: 'Under Review',
    date: '2024-01-15',
    amount: '125.7 BTC'
  },
  {
    id: 'AML-ETH-002',
    customer: 'Wallet: 0x742d35C...',
    crypto: 'ETH',
    riskLevel: 'Medium',
    status: 'Resolved',
    date: '2024-01-14',
    amount: '456.2 ETH'
  },
  {
    id: 'AML-BTC-003',
    customer: 'Exchange: Binance',
    crypto: 'BTC',
    riskLevel: 'High',
    status: 'Investigating',
    date: '2024-01-13',
    amount: '89.4 BTC'
  }
])

// Sankey chart data
const sankeyChartData = ref({
  nodes: [
    { id: 'exchanges', name: 'Exchanges', category: 'source' },
    { id: 'wallets', name: 'Personal Wallets', category: 'source' },
    { id: 'mixers', name: 'Mixing Services', category: 'suspicious' },
    { id: 'darknet', name: 'Darknet Markets', category: 'suspicious' },
    { id: 'gambling', name: 'Gambling Sites', category: 'medium' },
    { id: 'defi', name: 'DeFi Protocols', category: 'medium' },
    { id: 'sanctioned', name: 'Sanctioned Entities', category: 'high-risk' },
    { id: 'unknown', name: 'Unknown Addresses', category: 'high-risk' }
  ],
  links: [
    { source: 'exchanges', target: 'mixers', value: 45.7, risk: 'high' },
    { source: 'wallets', target: 'darknet', value: 23.4, risk: 'critical' },
    { source: 'exchanges', target: 'gambling', value: 67.2, risk: 'medium' },
    { source: 'wallets', target: 'defi', value: 89.1, risk: 'low' },
    { source: 'mixers', target: 'sanctioned', value: 12.8, risk: 'critical' },
    { source: 'darknet', target: 'unknown', value: 34.5, risk: 'high' },
    { source: 'gambling', target: 'mixers', value: 15.6, risk: 'medium' },
    { source: 'defi', target: 'unknown', value: 28.9, risk: 'medium' }
  ]
})

// Alert management methods
const dismissAlert = (alertId) => {
  const index = alerts.value.findIndex(alert => alert.id === alertId);
  if (index !== -1) {
    alerts.value.splice(index, 1);
    toast.add({
      severity: 'success',
      summary: 'Alert Dismissed',
      detail: 'Security alert has been dismissed successfully',
      life: 3000
    });
  }
}

const clearAllAlerts = () => {
  const alertCount = alerts.value.length;
  alerts.value = [];
  toast.add({
    severity: 'info',
    summary: 'All Alerts Cleared',
    detail: `${alertCount} alerts have been cleared`,
    life: 3000
  });
}

const markAllAsRead = () => {
  const unreadCount = alerts.value.filter(alert => !alert.read).length;
  alerts.value.forEach(alert => {
    alert.read = true;
  });
  toast.add({
    severity: 'success',
    summary: 'Alerts Marked as Read',
    detail: `${unreadCount} alerts marked as read`,
    life: 3000
  });
}

// Auto-generate new alerts (simulate real-time monitoring)
const generateNewAlert = () => {
  const alertTypes = ['critical', 'high', 'medium'];
  const cryptos = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK'];
  const sources = ['Blockchain Analysis', 'DEX Monitor', 'Pattern Analysis', 'Sanctions Screening', 'DeFi Security Monitor'];
  
  const newAlert = {
    id: Date.now(),
    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    title: 'New Security Alert Detected',
    description: 'Automated monitoring system has detected a new potential security threat requiring investigation.',
    time: 'Just now',
    timestamp: new Date(),
    crypto: cryptos[Math.floor(Math.random() * cryptos.length)],
    amount: `${(Math.random() * 100).toFixed(2)} ${cryptos[Math.floor(Math.random() * cryptos.length)]}`,
    severity: Math.floor(Math.random() * 100),
    read: false,
    source: sources[Math.floor(Math.random() * sources.length)],
    riskScore: (Math.random() * 10).toFixed(1),
    affectedWallets: Math.floor(Math.random() * 20) + 1,
    transactionHash: Math.random().toString(36).substring(2, 15) + '...',
    tags: ['automated-detection', 'real-time']
  };
  
  alerts.value.unshift(newAlert);
  
  // Show toast notification for new critical alerts
  if (newAlert.type === 'critical') {
    toast.add({
      severity: 'error',
      summary: 'Critical Alert',
      detail: newAlert.title,
      life: 5000
    });
  }
}

// Methods
const toggleQuickActions = () => {
  showQuickActions.value = !showQuickActions.value
}

const refreshData = async () => {
  isLoading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  lastUpdate.value = new Date()
  isLoading.value = false
  toast.add({
    severity: 'success',
    summary: 'Data Refreshed',
    detail: 'AML data has been updated successfully',
    life: 3000
  })
}

const navigateTo = (route) => {
  router.push(route)
  showQuickActions.value = false
}

const exportReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Export Started',
    detail: 'Generating AML compliance report...',
    life: 3000
  })
  showQuickActions.value = false
}

const updateTimeframe = (value) => {
  selectedTimeframe.value = value
}

// Computed properties
const totalCryptoVolume = computed(() => {
  return {
    btc: cryptoMetrics.value.activeCases.btc + cryptoMetrics.value.suspiciousTransactions.btc,
    eth: cryptoMetrics.value.activeCases.eth + cryptoMetrics.value.suspiciousTransactions.eth
  }
})

const alertStats = computed(() => {
  return {
    total: alerts.value.length,
    critical: alerts.value.filter(a => a.type === 'critical').length,
    high: alerts.value.filter(a => a.type === 'high').length,
    medium: alerts.value.filter(a => a.type === 'medium').length,
    unread: alerts.value.filter(a => !a.read).length
  }
})

onMounted(() => {
  // Initialize any required data
  
  // Simulate real-time alert generation every 45 seconds
  const alertInterval = setInterval(() => {
    if (Math.random() > 0.7) { // 30% chance of new alert
      generateNewAlert();
    }
  }, 45000);
  
  // Update timestamps every minute
  const timeInterval = setInterval(() => {
    alerts.value.forEach(alert => {
      const now = new Date();
      const diff = Math.floor((now - alert.timestamp) / 1000 / 60);
      if (diff < 60) {
        alert.time = diff === 0 ? 'Just now' : `${diff} min ago`;
      } else if (diff < 1440) {
        alert.time = `${Math.floor(diff / 60)} hour${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
      } else {
        alert.time = `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) > 1 ? 's' : ''} ago`;
      }
    });
  }, 60000);
  
  // Cleanup intervals on unmount
  return () => {
    clearInterval(alertInterval);
    clearInterval(timeInterval);
  };
})
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 transition-all duration-300">
        <!-- Header Section -->
        <div class="mb-8">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <div class="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                        </div>
                        <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            SigmaVerde Crypto AML
                        </h1>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300">Advanced Anti-Money Laundering monitoring for Cryptocurrency Ecosystem</p>
                </div>
                
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <!-- Alert Statistics -->
                    <div class="flex items-center gap-3">
                        <div class="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div class="flex items-center gap-4">
                                <div class="text-center">
                                    <div class="text-lg font-bold text-red-600 dark:text-red-400">{{ alertStats.critical }}</div>
                                    <div class="text-xs text-gray-500">Critical</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-bold text-orange-600 dark:text-orange-400">{{ alertStats.high }}</div>
                                    <div class="text-xs text-gray-500">High</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">{{ alertStats.medium }}</div>
                                    <div class="text-xs text-gray-500">Medium</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ alertStats.unread }}</div>
                                    <div class="text-xs text-gray-500">Unread</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-sm text-gray-500 dark:text-gray-400">Last Updated:</span>
                            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ lastUpdate.toLocaleTimeString() }}</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-sm font-medium text-green-700 dark:text-green-400">Live Monitoring</span>
                        </div>
                        
                        <button 
                            @click="refreshData" 
                            :disabled="isLoading"
                            class="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            <svg class="w-4 h-4" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Crypto AML Key Metrics -->
        <MetricsCards 
          :crypto-metrics="cryptoMetrics" 
          :selected-timeframe="selectedTimeframe"
          @update:selected-timeframe="updateTimeframe"
        />

        <!-- Main Dashboard Grid -->
        <div class="grid grid-cols-12 gap-6">

            <!-- Compliance Status -->
            <div class="col-span-12 xl:col-span-4">
                <ComplianceStatus />
            </div>

            <!-- Enhanced Alerts Panel with Full Screen Dialog -->
            <div class="col-span-12 xl:col-span-4">
                <AlertsPanel 
                    :alerts="alerts" 
                    @dismiss-alert="dismissAlert"
                    @clear-all="clearAllAlerts"
                    @mark-all-read="markAllAsRead"
                />
            </div>

            <!-- Regulatory Updates -->
            <div class="col-span-12 xl:col-span-4">
                <RegulatoryUpdates />
            </div>

            <!-- Transaction Flow Analysis -->
            <div class="col-span-12">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Transaction Flow Analysis</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Real-time cryptocurrency transaction monitoring</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-3">
                            <div class="bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
                                <span class="text-sm font-medium text-purple-700 dark:text-purple-300">
                                    {{ sankeyChartData.links.length }} Active Flows
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <SankeyChart :data="sankeyChartData" />
                </div>
            </div>

            <!-- Recent Cases -->
            <div class="col-span-12">
                <RecentCasesTable :recent-cases="recentCases" />
            </div>
        </div>

        <!-- Quick Actions FAB -->
        <QuickActionsFAB 
          :show-quick-actions="showQuickActions"
          @toggle="toggleQuickActions"
          @export-report="exportReport"
          @navigate="navigateTo"
        />

        <!-- Loading Overlay -->
        <div v-if="isLoading" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Updating AML Data</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Fetching latest cryptocurrency compliance information...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Real-time Alert Notifications -->
        <div class="fixed top-6 right-6 z-40 space-y-3 max-w-sm">
            <TransitionGroup name="notification" tag="div">
              <div class="fixed top-[88px] right-4 space-y-3 z-50">
                <NotificationAlert
                  v-for="alert in alerts.slice(0, 3).filter(a => !a.read && a.time === 'Just now')"
                  :key="`notification-${alert.id}`"
                  :alert="alert"
                  @dismiss="dismissAlert"
                />
              </div>

            </TransitionGroup>
        </div>
    </div>
    </div>
  </div>
</template>

<style scoped>

.dashboard-container {
  height: 100vh;
  overflow: hidden;
}

.dashboard-content {
  height: 100vh;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.dashboard-content::-webkit-scrollbar {
  width: 8px;
}

.dashboard-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.dashboard-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.dashboard-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Smooth animations */
.grid > * {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Professional card hover effects */
.dashboard-card {
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Gradient text animation */
@keyframes gradient {
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

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Pulse animation for critical elements */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
  }
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Table row hover effects */
tbody tr {
  transition: all 0.2s ease;
}

tbody tr:hover {
  transform: translateX(4px);
}

/* Button hover animations */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Backdrop blur support */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Custom focus styles */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* SigmaVerde brand colors */
.bg-sigmaverde {
  background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
}

.text-sigmaverde {
  color: #16a34a;
}

.border-sigmaverde {
  border-color: #16a34a;
}

/* Enhanced grid layout for address lookup */
.address-lookup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1280px) {
  .address-lookup-grid {
    grid-template-columns: 1fr;
  }
}

/* Real-time notification animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-move {
  transition: transform 0.5s ease;
}

/* Alert statistics styling */
.alert-stats {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .alert-stats {
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%);
  border-color: rgba(75, 85, 99, 0.3);
}

/* Enhanced alert notification styling */
.alert-notification {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.dark .alert-notification {
  background: rgba(31, 41, 55, 0.95);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.25),
    0 10px 10px -5px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(75, 85, 99, 0.2);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced hover effects for interactive elements */
.interactive-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* Glassmorphism effect for modern UI */
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.dark .glass-effect {
  background: rgba(17, 24, 39, 0.6);
  border-color: rgba(75, 85, 99, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(156, 163, 175, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .fixed.bottom-6.right-6 {
    bottom: 1rem;
    right: 1rem;
  }
  
  .fixed.top-6.right-6 {
    top: 1rem;
    right: 1rem;
    max-width: calc(100vw - 2rem);
  }
  
  .grid-cols-12 > * {
    grid-column: span 12;
  }
  
  .alert-notification {
    margin: 0 1rem;
  }
}

@media (max-width: 640px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .alert-stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
}

/* Print styles for reports */
@media print {
  .fixed {
    display: none !important;
  }
  
  .bg-gradient-to-br {
    background: white !important;
  }
  
  .dark\:bg-gray-900 {
    background: white !important;
  }
  
  .text-white {
    color: black !important;
  }
  
  .shadow-lg,
  .shadow-xl,
  .shadow-2xl {
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .bg-gray-50 {
    background-color: white;
  }
  
  .bg-gray-100 {
    background-color: #f5f5f5;
  }
  
  .border-gray-200 {
    border-color: #000;
  }
  
  .text-gray-600 {
    color: #000;
  }
  
  .glass-effect,
  .alert-notification {
    background: white !important;
    border: 2px solid #000 !important;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .animate-pulse,
  .animate-spin {
    animation: none !important;
  }
}

/* Enhanced focus indicators for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.375rem;
}

/* Custom scrollbar for webkit browsers */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>

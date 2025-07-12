<script setup>
import AddressLookup from '@/components/dashboard/AddressLookup.vue'
import SearchResults from '@/components/dashboard/SearchResults.vue'

import { useLayout } from '@/layout/composables/layout'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

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
const searchResults = ref([])
const isSearching = ref(false)
const hasSearched = ref(false)

// Mock search results data
const mockSearchResults = ref([
  {
    id: 1,
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    crypto: 'BTC',
    riskLevel: 'High',
    balance: '12.45678901',
    balanceUSD: 498234.56,
    transactionCount: 1247,
    lastActivity: '2 hours ago',
    tags: ['Exchange', 'Suspicious'],
    isWatched: false
  },
  {
    id: 2,
    address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    crypto: 'BTC',
    riskLevel: 'Medium',
    balance: '0.00234567',
    balanceUSD: 93.82,
    transactionCount: 23,
    lastActivity: '1 day ago',
    tags: ['Personal Wallet'],
    isWatched: true
  },
  {
    id: 3,
    address: '0x742d35Cc6C4C45C6C6C6C6C6C6C6C6C6C6C6C6C6',
    crypto: 'ETH',
    riskLevel: 'Critical',
    balance: '234.56789012',
    balanceUSD: 567890.12,
    transactionCount: 892,
    lastActivity: '15 minutes ago',
    tags: ['Mixing Service', 'Darknet Market'],
    isWatched: false
  },
  {
    id: 4,
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    crypto: 'BTC',
    riskLevel: 'Low',
    balance: '5.67890123',
    balanceUSD: 227156.49,
    transactionCount: 156,
    lastActivity: '3 hours ago',
    tags: ['DeFi Protocol'],
    isWatched: false
  },
  {
    id: 5,
    address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    crypto: 'BTC',
    riskLevel: 'Medium',
    balance: '89.12345678',
    balanceUSD: 3564938.27,
    transactionCount: 2341,
    lastActivity: '6 hours ago',
    tags: ['Exchange', 'Binance'],
    isWatched: true
  },
  {
    id: 6,
    address: '0x8ba1f109551bD432803012645Hac136c22C501e',
    crypto: 'ETH',
    riskLevel: 'High',
    balance: '1567.89012345',
    balanceUSD: 3791736.30,
    transactionCount: 4567,
    lastActivity: '30 minutes ago',
    tags: ['Gambling', 'High Volume'],
    isWatched: false
  },
  {
    id: 7,
    address: 'LTC1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    crypto: 'LTC',
    riskLevel: 'Low',
    balance: '123.45678901',
    balanceUSD: 11111.11,
    transactionCount: 78,
    lastActivity: '2 days ago',
    tags: ['Personal Wallet', 'Mining Pool'],
    isWatched: false
  },
  {
    id: 8,
    address: '1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX',
    crypto: 'BTC',
    riskLevel: 'Critical',
    balance: '456.78901234',
    balanceUSD: 18271560.49,
    transactionCount: 8901,
    lastActivity: '1 hour ago',
    tags: ['Sanctioned', 'Darknet Market'],
    isWatched: true
  },
  {
    id: 9,
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    crypto: 'ETH',
    riskLevel: 'Medium',
    balance: '789.01234567',
    balanceUSD: 1910299.50,
    transactionCount: 3456,
    lastActivity: '4 hours ago',
    tags: ['DeFi Protocol', 'Uniswap'],
    isWatched: false
  },
  {
    id: 10,
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    crypto: 'BTC',
    riskLevel: 'High',
    balance: '67.89012345',
    balanceUSD: 2715604.94,
    transactionCount: 1789,
    lastActivity: '8 hours ago',
    tags: ['Mixing Service', 'Privacy Coin'],
    isWatched: false
  },
  {
    id: 11,
    address: '3FupnqvVjNhRLpeLKPl1aNuMiJQsmtLix9',
    crypto: 'BTC',
    riskLevel: 'Low',
    balance: '12.34567890',
    balanceUSD: 493827.16,
    transactionCount: 234,
    lastActivity: '12 hours ago',
    tags: ['Exchange', 'Coinbase'],
    isWatched: false
  },
  {
    id: 12,
    address: '0xA0b86a33E6417c3c4c8c4c4c4c4c4c4c4c4c4c4c',
    crypto: 'ETH',
    riskLevel: 'Medium',
    balance: '345.67890123',
    balanceUSD: 836029.49,
    transactionCount: 567,
    lastActivity: '1 day ago',
    tags: ['Personal Wallet', 'DeFi'],
    isWatched: true
  }
])

// Mock data for crypto AML tracking (keeping existing data)
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

const alerts = ref([
  {
    id: 1,
    type: 'critical',
    title: 'Large BTC mixing service detected',
    description: 'Address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa involved in tumbling',
    time: '2 min ago',
    crypto: 'BTC',
    amount: '45.7 BTC'
  },
  {
    id: 2,
    type: 'high',
    title: 'ETH privacy coin conversion',
    description: 'Suspicious ETH to Monero exchange pattern detected',
    time: '15 min ago',
    crypto: 'ETH',
    amount: '234.5 ETH'
  },
  {
    id: 3,
    type: 'medium',
    title: 'Rapid transaction structuring',
    description: 'Multiple small BTC transactions below reporting threshold',
    time: '1 hour ago',
    crypto: 'BTC',
    amount: '12.3 BTC'
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

// Methods
const handleAddressSearch = (searchData) => {
  isSearching.value = true
  hasSearched.value = true
  
  // Simulate API call delay
  setTimeout(() => {
    // Filter mock results based on search criteria
    let results = [...mockSearchResults.value]
    
    if (searchData.query) {
      results = results.filter(result => 
        result.address.toLowerCase().includes(searchData.query.toLowerCase())
      )
    }
    
    if (searchData.crypto) {
      results = results.filter(result => result.crypto === searchData.crypto)
    }
    
    if (searchData.riskLevels && searchData.riskLevels.length > 0) {
      results = results.filter(result => 
        searchData.riskLevels.includes(result.riskLevel)
      )
    }
    
    searchResults.value = results
    isSearching.value = false
    
    toast.add({
      severity: 'success',
      summary: 'Search Complete',
      detail: `Found ${results.length} matching addresses`,
      life: 3000
    })
  }, 1500)
}

const handleAddressSelected = (address) => {
  toast.add({
    severity: 'info',
    summary: 'Address Selected',
    detail: `Viewing details for ${address.address.substring(0, 10)}...`,
    life: 3000
  })
}

const handleWatchlistUpdate = (address) => {
  // Update the address in search results
  const index = searchResults.value.findIndex(result => result.id === address.id)
  if (index !== -1) {
    searchResults.value[index] = { ...address }
  }
  
  // Also update in mock data
  const mockIndex = mockSearchResults.value.findIndex(result => result.id === address.id)
  if (mockIndex !== -1) {
    mockSearchResults.value[mockIndex] = { ...address }
  }
}

const refreshData = async () => {
  isSearching.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  isSearching.value = false
  toast.add({
    severity: 'success',
    summary: 'Data Refreshed',
    detail: 'Search data has been updated successfully',
    life: 3000
  })
}
const getRiskColor = (riskLevel) => {
  const colors = {
    'Low': 'bg-green-500',
    'Medium': 'bg-yellow-500',
    'High': 'bg-orange-500',
    'Critical': 'bg-red-500'
  }
  return colors[riskLevel] || colors['Low']
}

const getAlertBorderClass = (type) => {
  const classes = {
    'critical': 'border-l-red-500',
    'high': 'border-l-orange-500',
    'medium': 'border-l-yellow-500',
    'low': 'border-l-blue-500'
  }
  return classes[type] || classes['low']
}

const getAlertIconClass = (type) => {
  const classes = {
    'critical': 'bg-red-500',
    'high': 'bg-orange-500',
    'medium': 'bg-yellow-500',
    'low': 'bg-blue-500'
  }
  return classes[type] || classes['low']
}


const navigateTo = (route) => {
  router.push(route)
}

const exportReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Export Started',
    detail: 'Generating search results report...',
    life: 3000
  })
}

// Computed properties
const totalCryptoVolume = computed(() => {
  return {
    btc: cryptoMetrics.value.activeCases.btc + cryptoMetrics.value.suspiciousTransactions.btc,
    eth: cryptoMetrics.value.activeCases.eth + cryptoMetrics.value.suspiciousTransactions.eth
  }
})

onMounted(() => {
  // Initialize any required data
})
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 transition-all duration-300">
        
        <!-- Page Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Address Search & Analysis</h1>
                    <p class="text-gray-600 dark:text-gray-400">Search and analyze cryptocurrency addresses for AML compliance</p>
                </div>
                
            </div>
        </div>

        <!-- Main Dashboard Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-16 gap-6">
            <!-- Address Lookup Panel -->
            <div class="xl:col-span-5">
                <AddressLookup @search-performed="handleAddressSearch" />
            </div>

        </div>

        <!-- Search Results Section -->
        <div v-if="hasSearched" class="mt-8">
            <SearchResults 
                :results="searchResults"
                :loading="isSearching"
                @address-selected="handleAddressSelected"
                @watchlist-updated="handleWatchlistUpdate"
            />
        </div>

    </div>
</template>

<style scoped>
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
.bg-white:hover,
.dark .dark\:bg-gray-800:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

/* Button hover animations */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
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

/* Gradient backgrounds */
.bg-gradient-to-br {
  background: linear-gradient(135deg, var(--tw-gradient-stops));
}

/* Enhanced focus styles */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Alert border classes */
.border-l-red-500 {
  border-left-color: #ef4444;
}

.border-l-orange-500 {
  border-left-color: #f97316;
}

.border-l-yellow-500 {
  border-left-color: #eab308;
}

.border-l-blue-500 {
  border-left-color: #3b82f6;
}

/* Risk level colors */
.bg-green-500 {
  background-color: #10b981;
}

.bg-yellow-500 {
  background-color: #eab308;
}

.bg-orange-500 {
  background-color: #f97316;
}

.bg-red-500 {
  background-color: #ef4444;
}

/* Responsive adjustments */
@media (max-width: 1280px) {
  .xl\:col-span-5 {
    grid-column: span 12;
  }
  
  .xl\:col-span-7 {
    grid-column: span 12;
  }
}

@media (max-width: 768px) {
  .grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .flex.items-center.justify-between {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .flex.flex-wrap.gap-3 {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .p-6 {
    padding: 1rem;
  }
  
  .text-3xl {
    font-size: 1.875rem;
  }
  
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .gap-6 {
    gap: 1rem;
  }
}

/* Print styles */
@media print {
  .no-print {
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
  
  .shadow-lg {
    box-shadow: none !important;
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
}

/* Enhanced visual hierarchy */
.page-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.dark .page-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

/* Card elevation levels */
.elevation-1 {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.elevation-2 {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.elevation-3 {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
}

/* Interactive states */
.interactive:hover {
  cursor: pointer;
}

.interactive:active {
  transform: scale(0.98);
}

/* Status indicators */
.status-indicator {
  position: relative;
}

.status-indicator::before {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-active::before {
  background-color: #10b981;
  animation: pulse 2s infinite;
}

.status-warning::before {
  background-color: #f59e0b;
}

.status-error::before {
  background-color: #ef4444;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* Modern glassmorphism */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.dark .glass-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* Tooltip enhancements */
[data-tooltip] {
  position: relative;
}

[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  white-space: nowrap;
  z-index: 1000;
  animation: tooltipFadeIn 0.2s ease-out;
}

[data-tooltip]:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(1px);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Loading states */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.dark .loading-skeleton {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Custom scrollbar for specific containers */
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* Enhanced button styles */
.btn-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-gradient:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

/* Data visualization enhancements */
.chart-container {
  position: relative;
  overflow: hidden;
}

.chart-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: chartShine 3s ease-in-out infinite;
}

@keyframes chartShine {
  0%, 100% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
}

/* Accessibility improvements */
.focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.screen-reader-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Modern card design patterns */
.card-modern {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.dark .card-modern {
  background: #1f2937;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dark .card-modern:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
}

/* Performance optimizations */
.will-change-transform {
  will-change: transform;
}

.will-change-opacity {
  will-change: opacity;
}

/* Container queries fallback */
@supports not (container-type: inline-size) {
  .container-fallback {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
}

/* Modern CSS features */
.aspect-ratio-16-9 {
  aspect-ratio: 16 / 9;
}

.aspect-ratio-1-1 {
  aspect-ratio: 1 / 1;
}

/* Logical properties for internationalization */
.logical-margin {
  margin-block: 1rem;
  margin-inline: 2rem;
}

.logical-padding {
  padding-block: 0.5rem;
  padding-inline: 1rem;
}

/* CSS custom properties for theming */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --surface-color: #ffffff;
  --text-color: #1f2937;
}

.dark {
  --surface-color: #1f2937;
  --text-color: #f9fafb;
}

.themed-element {
  background-color: var(--surface-color);
  color: var(--text-color);
  border-color: var(--primary-color);
}
</style>

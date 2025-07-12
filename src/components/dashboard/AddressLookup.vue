<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Address Lookup</h3>
      </div>
      <button 
        @click="openLookupModal"
        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
      >
        Advanced Search
      </button>
    </div>

    <!-- Quick Search -->
    <div class="space-y-4">
      <div class="relative">
        <input
          v-model="quickSearchAddress"
          @keyup.enter="performQuickSearch"
          type="text"
          placeholder="Enter wallet address or transaction hash..."
          class="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        >
        <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      
      <div class="flex gap-2">
        <button 
          @click="performQuickSearch"
          :disabled="!quickSearchAddress || isSearching"
          class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          <span v-if="!isSearching">Search</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching...
          </span>
        </button>
        <button 
          @click="clearSearch"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Recent Searches -->
    <div v-if="recentSearches.length > 0" class="mt-6">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Searches</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="search in recentSearches.slice(0, 5)"
          :key="search.address"
          @click="quickSearchAddress = search.address; performQuickSearch()"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs transition-colors"
        >
          {{ search.address.substring(0, 8) }}...{{ search.address.substring(search.address.length - 6) }}
        </button>
      </div>
    </div>

    <!-- Advanced Lookup Modal -->
    <Dialog 
      v-model:visible="showLookupModal" 
      modal 
      header="Advanced Address Lookup"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      class="p-fluid"
    >
      <template #default>
        <form @submit.prevent="performAdvancedSearch" class="space-y-6">
          <!-- Search Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Type</label>
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input v-model="searchForm.type" type="radio" value="address" class="mr-3">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">Wallet Address</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Search by crypto address</div>
                </div>
              </label>
              <label class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input v-model="searchForm.type" type="radio" value="transaction" class="mr-3">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">Transaction Hash</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Search by TX hash</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Address/Hash Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ searchForm.type === 'address' ? 'Wallet Address' : 'Transaction Hash' }}
            </label>
            <input
              v-model="searchForm.query"
              type="text"
              :placeholder="searchForm.type === 'address' ? 'Enter wallet address...' : 'Enter transaction hash...'"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              required
            >
          </div>

          <!-- Cryptocurrency Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cryptocurrency</label>
            <select 
              v-model="searchForm.crypto"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
            >
              <option value="">All Cryptocurrencies</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="LTC">Litecoin (LTC)</option>
              <option value="BCH">Bitcoin Cash (BCH)</option>
              <option value="XMR">Monero (XMR)</option>
              <option value="ZEC">Zcash (ZEC)</option>
            </select>
          </div>

          <!-- Risk Level Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Risk Level Filter</label>
            <div class="grid grid-cols-4 gap-2">
              <label class="flex items-center">
                <input v-model="searchForm.riskLevels" type="checkbox" value="low" class="mr-2">
                <span class="text-sm text-green-600 dark:text-green-400">Low</span>
              </label>
              <label class="flex items-center">
                <input v-model="searchForm.riskLevels" type="checkbox" value="medium" class="mr-2">
                <span class="text-sm text-yellow-600 dark:text-yellow-400">Medium</span>
              </label>
              <label class="flex items-center">
                <input v-model="searchForm.riskLevels" type="checkbox" value="high" class="mr-2">
                <span class="text-sm text-orange-600 dark:text-orange-400">High</span>
              </label>
              <label class="flex items-center">
                <input v-model="searchForm.riskLevels" type="checkbox" value="critical" class="mr-2">
                <span class="text-sm text-red-600 dark:text-red-400">Critical</span>
              </label>
            </div>
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
              <input
                v-model="searchForm.dateFrom"
                type="date"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
              <input
                v-model="searchForm.dateTo"
                type="date"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
              >
            </div>
          </div>

          <!-- Amount Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Amount</label>
              <input
                v-model="searchForm.amountMin"
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Amount</label>
              <input
                v-model="searchForm.amountMax"
                type="number"
                step="0.00000001"
                placeholder="999999.99999999"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              >
            </div>
          </div>

          <!-- Include Sanctioned Addresses -->
          <div class="flex items-center">
            <input 
              v-model="searchForm.includeSanctioned" 
              type="checkbox" 
              id="sanctioned"
              class="mr-3"
            >
            <label for="sanctioned" class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Include sanctioned addresses in results
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="!searchForm.query || isSearching"
              class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              <span v-if="!isSearching">Search Address</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            </button>
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium"
            >
              Reset
            </button>
            <button
              type="button"
              @click="closeLookupModal"
              class="px-6 py-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </template>
    </Dialog>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="mt-6">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Search Results</h4>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ searchResults.length }} results found</span>
      </div>
      
      <div class="space-y-3">
        <div
          v-for="result in searchResults"
          :key="result.id"
          class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          @click="viewAddressDetails(result)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div class="flex items-center gap-2">
                  <div :class="getRiskBadgeClass(result.riskLevel)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ result.riskLevel }}
                  </div>
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {{ result.crypto }}
                  </span>
                </div>
              </div>
              
              <div class="font-mono text-sm text-gray-900 dark:text-white mb-1">
                {{ result.address }}
              </div>
              
              <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Balance: {{ result.balance }} {{ result.crypto }}</span>
                <span>Transactions: {{ result.transactionCount }}</span>
                <span>Last Activity: {{ result.lastActivity }}</span>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button
                @click.stop="addToWatchlist(result)"
                class="p-2 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                title="Add to Watchlist"
              >
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </button>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="hasSearched && searchResults.length === 0" class="mt-6 text-center py-8">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Results Found</h3>
      <p class="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or check the address format.</p>
    </div>

    <!-- Address Detail Modal -->
    <AddressDetail
      :addressData="selectedAddress"
      :showModal="showAddressDetail"
      @close="closeAddressDetail"
      @view-address="viewConnectedAddress"
    />
  </div>
</template>

<script setup>
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { reactive, ref } from 'vue'
import AddressDetail from './AddressDetail.vue'

const toast = useToast()

// Reactive data
const quickSearchAddress = ref('')
const isSearching = ref(false)
const showLookupModal = ref(false)
const showAddressDetail = ref(false)
const hasSearched = ref(false)
const searchResults = ref([])
const selectedAddress = ref({})
const recentSearches = ref([
  { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', timestamp: new Date() },
  { address: '0x742d35Cc6C4C45C6C6C6C6C6C6C6C6C6C6C6C6C6', timestamp: new Date() },
  { address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', timestamp: new Date() }
])

// Search form data
const searchForm = reactive({
  type: 'address',
  query: '',
  crypto: '',
  riskLevels: [],
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  includeSanctioned: false
})

// Methods
const openLookupModal = () => {
  showLookupModal.value = true
}

const closeLookupModal = () => {
  showLookupModal.value = false
}

const resetForm = () => {
  Object.assign(searchForm, {
    type: 'address',
    query: '',
    crypto: '',
    riskLevels: [],
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    includeSanctioned: false
  })
}

const performQuickSearch = async () => {
  if (!quickSearchAddress.value.trim()) return
  
  isSearching.value = true
  hasSearched.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock search results
    searchResults.value = [
      {
        id: 1,
        address: quickSearchAddress.value,
        crypto: 'BTC',
        riskLevel: 'High',
        balance: '12.45678901',
        transactionCount: 1247,
        lastActivity: '2 hours ago',
        tags: ['Exchange', 'Suspicious']
      },
      {
        id: 2,
        address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        crypto: 'BTC',
        riskLevel: 'Medium',
        balance: '0.00234567',
        transactionCount: 23,
        lastActivity: '1 day ago',
        tags: ['Personal Wallet']
      }
    ]
    
    // Add to recent searches
    addToRecentSearches(quickSearchAddress.value)
    
    toast.add({
      severity: 'success',
      summary: 'Search Complete',
      detail: `Found ${searchResults.value.length} results`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Search Failed',
      detail: 'Unable to perform address lookup',
      life: 3000
    })
  } finally {
    isSearching.value = false
  }
}

const performAdvancedSearch = async () => {
  isSearching.value = true
  hasSearched.value = true
  
  try {
    // Simulate API call with advanced parameters
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock advanced search results based on form data
    const mockResults = generateMockResults(searchForm)
    searchResults.value = mockResults
    
    // Add to recent searches
    addToRecentSearches(searchForm.query)
    
    closeLookupModal()
    
    toast.add({
      severity: 'success',
      summary: 'Advanced Search Complete',
      detail: `Found ${searchResults.value.length} results with advanced criteria`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Search Failed',
      detail: 'Unable to perform advanced search',
      life: 3000
    })
  } finally {
    isSearching.value = false
  }
}

const generateMockResults = (form) => {
  const results = []
  const cryptos = form.crypto ? [form.crypto] : ['BTC', 'ETH', 'LTC']
  const riskLevels = form.riskLevels.length > 0 ? form.riskLevels : ['Low', 'Medium', 'High', 'Critical']
  
  for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
    results.push({
      id: i + 1,
      address: form.query || generateMockAddress(),
      crypto: cryptos[Math.floor(Math.random() * cryptos.length)],
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      balance: (Math.random() * 100).toFixed(8),
      transactionCount: Math.floor(Math.random() * 1000) + 1,
      lastActivity: `${Math.floor(Math.random() * 24)} hours ago`,
      tags: ['Exchange', 'Personal Wallet', 'Mixer', 'DeFi'][Math.floor(Math.random() * 4)]
    })
  }
  
  return results
}

const generateMockAddress = () => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let result = '1'
  for (let i = 0; i < 33; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const clearSearch = () => {
  quickSearchAddress.value = ''
  searchResults.value = []
  hasSearched.value = false
}

const addToRecentSearches = (address) => {
  const existing = recentSearches.value.findIndex(s => s.address === address)
  if (existing !== -1) {
    recentSearches.value.splice(existing, 1)
  }
  
  recentSearches.value.unshift({
    address,
    timestamp: new Date()
  })
  
  // Keep only last 10 searches
  if (recentSearches.value.length > 10) {
    recentSearches.value = recentSearches.value.slice(0, 10)
  }
}

const getRiskBadgeClass = (riskLevel) => {
  const classes = {
    'Low': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'Medium': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    'High': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    'Critical': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }
  return classes[riskLevel] || classes['Low']
}

const viewAddressDetails = (result) => {
  // Create comprehensive address data for the detail modal
  selectedAddress.value = {
    address: result.address,
    crypto: result.crypto,
    riskLevel: result.riskLevel,
    balance: result.balance,
    balanceUSD: parseFloat(result.balance) * 40000, // Mock USD conversion
    transactionCount: result.transactionCount,
    lastActivity: result.lastActivity,
    firstSeen: '2021-03-15 09:23:45',
    addressType: 'P2PKH (Legacy)',
    uniqueCounterparties: Math.floor(result.transactionCount * 0.3),
    totalReceived: (parseFloat(result.balance) * 1.5).toFixed(8),
    totalSent: (parseFloat(result.balance) * 0.5).toFixed(8),
    riskTags: generateRiskTags(result.riskLevel),
    tags: result.tags || []
  }
  
  showAddressDetail.value = true
  
  toast.add({
    severity: 'info',
    summary: 'Loading Address Details',
    detail: `Analyzing ${result.address.substring(0, 10)}...`,
    life: 2000
  })
}

const closeAddressDetail = () => {
  showAddressDetail.value = false
  selectedAddress.value = {}
}

const viewConnectedAddress = (connection) => {
  // Handle viewing connected addresses
  selectedAddress.value = {
    address: connection.address,
    crypto: 'BTC', // Default to BTC for connected addresses
    riskLevel: connection.riskLevel,
    balance: connection.totalAmount,
    balanceUSD: parseFloat(connection.totalAmount) * 40000,
    transactionCount: connection.transactionCount,
    lastActivity: '1 hour ago',
    firstSeen: '2022-01-10 14:30:22',
    addressType: 'P2SH (SegWit)',
    uniqueCounterparties: Math.floor(connection.transactionCount * 0.4),
    totalReceived: (parseFloat(connection.totalAmount) * 2).toFixed(8),
    totalSent: (parseFloat(connection.totalAmount) * 1).toFixed(8),
    riskTags: generateRiskTags(connection.riskLevel),
    tags: [connection.label]
  }
  
  toast.add({
    severity: 'info',
    summary: 'Loading Connected Address',
    detail: `Analyzing connected address: ${connection.label}`,
    life: 2000
  })
}

const generateRiskTags = (riskLevel) => {
  const tagMap = {
    'Low': ['Personal Wallet', 'KYC Verified'],
    'Medium': ['Exchange', 'High Volume'],
    'High': ['Mixing Service', 'Privacy Coin'],
    'Critical': ['Darknet Market', 'Sanctioned', 'Mixing Service']
  }
  return tagMap[riskLevel] || []
}

const addToWatchlist = (result) => {
  toast.add({
    severity: 'success',
    summary: 'Added to Watchlist',
    detail: `${result.address.substring(0, 10)}... added to monitoring`,
    life: 3000
  })
}
</script>

<style scoped>
/* PrimeVue Dialog Customization */
:deep(.p-dialog) {
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

:deep(.p-dialog-header) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
  border-radius: 1rem 1rem 0 0;
  padding: 1.5rem;
}

:deep(.p-dialog-title) {
  font-weight: 700;
  font-size: 1.25rem;
  color: #1f2937;
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
  background: #ffffff;
}

:deep(.p-dialog-footer) {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-radius: 0 0 1rem 1rem;
  padding: 1rem 1.5rem;
}

/* Dark mode support for Dialog */
.dark :deep(.p-dialog-header) {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-bottom-color: #374151;
}

.dark :deep(.p-dialog-title) {
  color: #f9fafb;
}

.dark :deep(.p-dialog-content) {
  background: #1f2937;
  color: #f9fafb;
}

.dark :deep(.p-dialog-footer) {
  background: #111827;
  border-top-color: #374151;
}

/* Enhanced hover effects for Dialog elements */
:deep(.p-dialog-header-close) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.p-dialog-header-close:hover) {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  transform: scale(1.1);
}

/* Form styling within Dialog */
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

/* Button hover effects */
button {
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button.bg-green-600:not(:disabled):hover {
  background-color: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}

button.bg-gray-200:not(:disabled):hover {
  background-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

button.bg-red-100:not(:disabled):hover {
  background-color: #fecaca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Form elements styling */
input, select, textarea {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

/* Radio and checkbox styling */
input[type="radio"], input[type="checkbox"] {
  accent-color: #22c55e;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.p-dialog) {
    margin: 1rem;
    width: calc(100vw - 2rem) !important;
    max-width: none !important;
  }
  
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
  
  .flex.gap-3 {
    flex-direction: column;
  }
}
</style>

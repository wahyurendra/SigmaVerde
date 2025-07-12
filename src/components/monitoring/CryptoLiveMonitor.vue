<template>
    <div class="crypto-live-monitor">
        <!-- Header with controls -->
        <div class="flex flex-column sm:flex-row sm:justify-content-between sm:align-items-center mb-4">
            <div class="flex align-items-center gap-3 mb-3 sm:mb-0">
                <h5 class="text-900 font-semibold m-0">{{ title }}</h5>
                <div class="flex align-items-center gap-2 surface-100 border-round px-3 py-2">
                    <div class="border-circle w-2rem h-2rem bg-green-100 flex align-items-center justify-content-center">
                        <i class="pi pi-circle-fill text-green-500 text-sm animation-pulse"></i>
                    </div>
                    <span class="text-sm font-medium text-700">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
                </div>
            </div>
            
            <div class="flex align-items-center gap-2">
                <Dropdown v-if="showNetworkFilter" 
                         v-model="selectedNetwork" 
                         :options="networks" 
                         optionLabel="name" 
                         placeholder="All Networks"
                         class="w-full sm:w-12rem" />
                
                <Button :icon="isPaused ? 'pi pi-play' : 'pi pi-pause'" 
                       :class="['p-button-rounded p-button-text', {'text-primary': !isPaused, 'text-red-600': isPaused}]"
                       v-tooltip.top="isPaused ? 'Resume Feed' : 'Pause Feed'"
                       @click="togglePause" />
                
                <Button icon="pi pi-refresh" 
                       class="p-button-rounded p-button-text"
                       v-tooltip.top="'Refresh'"
                       @click="refresh" />
                
                <Button v-if="showSettings"
                       icon="pi pi-cog" 
                       class="p-button-rounded p-button-text"
                       v-tooltip.top="'Settings'"
                       @click="$emit('settings')" />
            </div>
        </div>

        <!-- Connection Status Banner -->
        <div v-if="!isConnected" class="p-3 mb-4 bg-red-50 border-round text-red-900 text-sm">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            Connection lost. Attempting to reconnect...
        </div>

        <!-- Live Feed Container -->
        <div class="live-feed-container" :style="{ height: feedHeight }">
            <div v-if="loading" class="flex align-items-center justify-content-center h-full">
                <ProgressSpinner size="50px" strokeWidth="4" />
            </div>
            
            <div v-else-if="transactions.length === 0" class="flex align-items-center justify-content-center h-full text-500">
                <div class="text-center">
                    <i class="pi pi-inbox text-4xl mb-3"></i>
                    <p class="m-0">No transactions to display</p>
                </div>
            </div>
            
            <div v-else class="transaction-feed p-2">
                <TransitionGroup name="transaction" tag="div">
                    <div v-for="transaction in visibleTransactions" 
                         :key="transaction.id" 
                         :class="['transaction-item surface-card shadow-1 border-round-xl mb-3', 
                                 getTransactionClass(transaction)]"
                         @click="$emit('transaction-click', transaction)">
                        
                        <!-- Transaction Header -->
                        <div class="flex justify-content-between align-items-center p-3 pb-2">
                            <div class="flex align-items-center gap-2">
                                <Tag :value="transaction.network" 
                                     severity="info" 
                                     class="text-xs font-medium" />
                                <Tag :value="transaction.riskLevel" 
                                     :severity="getRiskSeverity(transaction.riskLevel)" 
                                     class="text-xs font-medium" />
                            </div>
                            <span class="text-500 text-sm">{{ formatTime(transaction.timestamp) }}</span>
                        </div>
                        
                        <!-- Transaction Content -->
                        <div class="px-3 pb-3">
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <div class="text-sm text-500 mb-1">From:</div>
                                    <div class="font-mono text-sm surface-100 p-2 border-round">
                                        {{ truncateAddress(transaction.from) }}
                                    </div>
                                </div>
                                <div class="col-12 md:col-6">
                                    <div class="text-sm text-500 mb-1">To:</div>
                                    <div class="font-mono text-sm surface-100 p-2 border-round">
                                        {{ truncateAddress(transaction.to) }}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex flex-wrap align-items-center gap-4 mt-3">
                                <div>
                                    <span class="text-500 text-sm">Amount: </span>
                                    <span class="font-medium text-900">${{ formatCurrency(transaction.amount) }}</span>
                                </div>
                                <div>
                                    <span class="text-500 text-sm">Fee: </span>
                                    <span class="text-700">${{ formatCurrency(transaction.fee) }}</span>
                                </div>
                                <div v-if="transaction.gasPrice">
                                    <span class="text-500 text-sm">Gas: </span>
                                    <span class="text-700">{{ transaction.gasPrice }} Gwei</span>
                                </div>
                            </div>
                            
                            <!-- Suspicious Flags -->
                            <div v-if="transaction.suspiciousFlags && transaction.suspiciousFlags.length > 0" class="mt-3">
                                <div class="text-sm text-500 mb-2">Suspicious Indicators:</div>
                                <div class="flex flex-wrap gap-2">
                                    <Chip v-for="flag in transaction.suspiciousFlags" 
                                          :key="flag" 
                                          :label="flag" 
                                          class="text-xs bg-red-50 text-red-900" />
                                </div>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div v-if="showActions" class="flex justify-content-end gap-2 mt-3">
                                <Button icon="pi pi-search" 
                                       class="p-button-rounded p-button-text p-button-sm" 
                                       v-tooltip.top="'Investigate'"
                                       @click.stop="$emit('investigate', transaction)" />
                                <Button icon="pi pi-flag" 
                                       class="p-button-rounded p-button-text p-button-danger p-button-sm" 
                                       v-tooltip.top="'Flag as Suspicious'"
                                       @click.stop="$emit('flag', transaction)" />
                                <Button icon="pi pi-external-link" 
                                       class="p-button-rounded p-button-text p-button-sm" 
                                       v-tooltip.top="'View on Explorer'"
                                       @click.stop="openExplorer(transaction)" />
                            </div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </div>

        <!-- Footer with stats -->
        <div v-if="showStats" class="flex justify-content-between align-items-center mt-3 pt-3 border-top-1 surface-border">
            <div class="flex gap-4">
                <div class="text-center">
                    <div class="text-lg font-bold text-900">{{ totalTransactions }}</div>
                    <div class="text-xs text-500">Total</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-red-500">{{ suspiciousCount }}</div>
                    <div class="text-xs text-500">Suspicious</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-green-500">{{ averageTime }}ms</div>
                    <div class="text-xs text-500">Avg Time</div>
                </div>
            </div>
            
            <div class="text-sm text-500">
                Last update: {{ lastUpdateTime }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { useCryptoMonitoring } from '@/composables/useCryptoMonitoring';
import { getExplorerUrl } from '@/utils/CryptoUtils';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import Dropdown from 'primevue/dropdown';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// Props
const props = defineProps({
    title: {
        type: String,
        default: 'Live Transaction Feed'
    },
    feedHeight: {
        type: String,
        default: '600px'
    },
    maxTransactions: {
        type: Number,
        default: 20
    },
    updateInterval: {
        type: Number,
        default: 3000
    },
    showNetworkFilter: {
        type: Boolean,
        default: true
    },
    showActions: {
        type: Boolean,
        default: true
    },
    showStats: {
        type: Boolean,
        default: true
    },
    showSettings: {
        type: Boolean,
        default: false
    },
    autoConnect: {
        type: Boolean,
        default: true
    }
});

// Emits
const emit = defineEmits([
    'transaction-click',
    'investigate',
    'flag',
    'settings',
    'connection-change'
]);

// Composables
const {
    networks,
    liveTransactions,
    selectedNetwork,
    isPaused,
    togglePause,
    getTransactionClass,
    getRiskSeverity,
    truncateAddress,
    formatCurrency,
    formatTime
} = useCryptoMonitoring();

// Local state
const loading = ref(false);
const isConnected = ref(false);
const lastUpdateTime = ref('');
const connectionInterval = ref(null);
const updateInterval = ref(null);

// Computed properties
const transactions = computed(() => {
    if (!selectedNetwork.value) return liveTransactions.value;
    return liveTransactions.value.filter(tx => tx.network === selectedNetwork.value.code);
});

const visibleTransactions = computed(() => {
    return transactions.value.slice(0, props.maxTransactions);
});

const totalTransactions = computed(() => {
    return transactions.value.length;
});

const suspiciousCount = computed(() => {
    return transactions.value.filter(tx => 
        tx.riskLevel === 'HIGH' || tx.riskLevel === 'CRITICAL'
    ).length;
});

const averageTime = computed(() => {
    // Mock average processing time
    return Math.floor(Math.random() * 100) + 50;
});

// Methods
const connect = async () => {
    loading.value = true;
    try {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        isConnected.value = true;
        emit('connection-change', true);
        startUpdates();
    } catch (error) {
        console.error('Connection failed:', error);
        isConnected.value = false;
        emit('connection-change', false);
    } finally {
        loading.value = false;
    }
};

const disconnect = () => {
    isConnected.value = false;
    stopUpdates();
    emit('connection-change', false);
};

const refresh = () => {
    if (isConnected.value) {
        updateLastUpdateTime();
    } else {
        connect();
    }
};

const startUpdates = () => {
    if (updateInterval.value) return;
    
    updateInterval.value = setInterval(() => {
        if (!isPaused.value && isConnected.value) {
            updateLastUpdateTime();
        }
    }, props.updateInterval);
};

const stopUpdates = () => {
    if (updateInterval.value) {
        clearInterval(updateInterval.value);
        updateInterval.value = null;
    }
};

const updateLastUpdateTime = () => {
    lastUpdateTime.value = new Date().toLocaleTimeString();
};

const openExplorer = (transaction) => {
    const url = getExplorerUrl(transaction.network, 'transaction', transaction.hash);
    if (url) {
        window.open(url, '_blank');
    }
};

const simulateConnectionLoss = () => {
    // Simulate random connection issues
    if (Math.random() < 0.05) { // 5% chance
        isConnected.value = false;
        emit('connection-change', false);
        
        // Auto-reconnect after 2-5 seconds
        setTimeout(() => {
            if (props.autoConnect) {
                connect();
            }
        }, Math.random() * 3000 + 2000);
    }
};

// Watchers
watch(() => props.updateInterval, (newInterval) => {
    if (updateInterval.value) {
        stopUpdates();
        startUpdates();
    }
});

watch(isPaused, (paused) => {
    if (paused) {
        stopUpdates();
    } else if (isConnected.value) {
        startUpdates();
    }
});

// Lifecycle
onMounted(() => {
    if (props.autoConnect) {
        connect();
    }
    
    // Simulate occasional connection issues
    connectionInterval.value = setInterval(simulateConnectionLoss, 30000);
    updateLastUpdateTime();
});

onUnmounted(() => {
    stopUpdates();
    if (connectionInterval.value) {
        clearInterval(connectionInterval.value);
    }
});

// Expose methods for parent component
defineExpose({
    connect,
    disconnect,
    refresh,
    isConnected: computed(() => isConnected.value),
    transactionCount: computed(() => transactions.value.length)
});
</script>

<style scoped>
.crypto-live-monitor {
    --monitor-border-radius: 0.75rem;
    --monitor-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.live-feed-container {
    border: 1px solid var(--surface-border);
    border-radius: var(--monitor-border-radius);
    overflow: hidden;
    background: var(--surface-ground);
}

.transaction-feed {
    height: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--surface-400) transparent;
}

.transaction-feed::-webkit-scrollbar {
    width: 6px;
}

.transaction-feed::-webkit-scrollbar-track {
    background: transparent;
}

.transaction-feed::-webkit-scrollbar-thumb {
    background: var(--surface-400);
    border-radius: 3px;
}

.transaction-item {
    transition: all 0.3s ease;
    cursor: pointer;
    border-left: 4px solid transparent;
}

.transaction-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Risk level styling */
.low-risk {
    border-left-color: var(--green-500);
}

.medium-risk {
    border-left-color: var(--yellow-500);
}

.high-risk {
    border-left-color: var(--orange-500);
}

.critical-risk {
    border-left-color: var(--red-500);
    animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
    0%, 100% {
        border-left-color: var(--red-500);
    }
    50% {
        border-left-color: var(--red-300);
    }
}

/* Animation for new transactions */
.transaction-enter-active {
    transition: all 0.5s ease;
}

.transaction-leave-active {
    transition: all 0.3s ease;
}

.transaction-enter-from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
}

.transaction-leave-to {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
}

.transaction-move {
    transition: transform 0.3s ease;
}

/* Pulse animation for connection indicator */
.animation-pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
    .transaction-item {
        margin-bottom: 0.75rem;
    }
    
    .transaction-item .grid {
        margin: 0;
    }
    
    .transaction-item .col-12 {
        padding: 0.25rem;
    }
}

@media screen and (max-width: 576px) {
    .live-feed-container {
        border-radius: 0.5rem;
    }
    
    .transaction-item {
        margin-bottom: 0.5rem;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .live-feed-container {
        background: var(--surface-900);
        border-color: var(--surface-700);
    }
}

/* High contrast mode */
@media (prefers-contrast: high) {
    .transaction-item {
        border-width: 2px;
        border-style: solid;
    }
    
    .low-risk {
        border-color: var(--green-600);
    }
    
    .medium-risk {
        border-color: var(--yellow-600);
    }
    
    .high-risk {
        border-color: var(--orange-600);
    }
    
    .critical-risk {
        border-color: var(--red-600);
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .transaction-item,
    .animation-pulse,
    .critical-risk {
        animation: none;
        transition: none;
    }
    
    .transaction-enter-active,
    .transaction-leave-active,
    .transaction-move {
        transition: none;
    }
}

/* Focus states for accessibility */
.transaction-item:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
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

/* Connection status styling */
.connection-status {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
}

.connection-status.connected {
    background: var(--green-50);
    color: var(--green-900);
    border: 1px solid var(--green-200);
}

.connection-status.disconnected {
    background: var(--red-50);
    color: var(--red-900);
    border: 1px solid var(--red-200);
}

/* Stats footer styling */
.stats-footer {
    background: var(--surface-50);
    border-top: 1px solid var(--surface-200);
    padding: 1rem;
}

/* Custom scrollbar for better UX */
.transaction-feed {
    scroll-behavior: smooth;
}

/* Hover effects for better interactivity */
.transaction-item .p-button:hover {
    transform: scale(1.05);
}

/* Chip styling improvements */
:deep(.p-chip) {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
}

/* Tag styling improvements */
:deep(.p-tag) {
    font-size: 0.75rem;
    font-weight: 500;
}
</style>

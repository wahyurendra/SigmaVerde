<script setup>
import { ref } from 'vue'

// Sample trend data for the last 6 months
const trendData = ref([
  { month: 'Jan', critical: 18, high: 28, medium: 42 },
  { month: 'Feb', critical: 22, high: 32, medium: 44 },
  { month: 'Mar', critical: 25, high: 35, medium: 48 },
  { month: 'Apr', critical: 28, high: 33, medium: 45 },
  { month: 'May', critical: 26, high: 30, medium: 47 },
  { month: 'Jun', critical: 23, high: 31, medium: 46 }
])

// Convert data to SVG path coordinates
const createPath = (data, key, maxValue = 60) => {
  const width = 280
  const height = 80
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - (item[key] / maxValue) * height
    return `${x},${y}`
  })
  return `M ${points.join(' L ')}`
}
</script>

<template>
  <div class="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 dark:from-gray-900 dark:via-emerald-950/20 dark:to-green-950/30 rounded-3xl shadow-2xl border border-emerald-200/50 dark:border-emerald-800/30 p-8 mb-8 backdrop-blur-sm">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <div class="relative p-3 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div>
          <h3 class="text-2xl font-bold bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 dark:from-emerald-300 dark:via-green-300 dark:to-teal-300 bg-clip-text text-transparent">
            Crypto Compliance Status
          </h3>
          <p class="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Real-time risk assessment</p>
        </div>
      </div>
      <div class="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span class="text-xs font-semibold text-emerald-700 dark:text-emerald-300">LIVE</span>
      </div>
    </div>

    <!-- Risk Status Cards -->
    <div class="grid gap-4 mb-8">
      <!-- Critical Risk -->
      <div class="group relative overflow-hidden bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 dark:from-red-950/30 dark:via-rose-950/30 dark:to-pink-950/30 rounded-2xl border border-red-200/60 dark:border-red-800/40 p-5 hover:shadow-lg transition-all duration-300">
        <div class="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="relative flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="w-5 h-5 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-lg"></div>
              <div class="absolute inset-0 w-5 h-5 bg-gradient-to-br from-red-500 to-rose-600 rounded-full animate-ping opacity-20"></div>
            </div>
            <div>
              <span class="text-base font-bold text-red-700 dark:text-red-300">Critical Risk</span>
              <p class="text-xs text-red-600/80 dark:text-red-400/80">Immediate attention required</p>
            </div>
          </div>
          <div class="text-right">
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-red-900 dark:text-red-100">23</span>
              <span class="text-lg font-bold text-red-700 dark:text-red-300">%</span>
            </div>
            <p class="text-sm text-red-600 dark:text-red-400 font-semibold">58 addresses</p>
          </div>
        </div>
      </div>
      
      <!-- High Risk -->
      <div class="group relative overflow-hidden bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30 rounded-2xl border border-orange-200/60 dark:border-orange-800/40 p-5 hover:shadow-lg transition-all duration-300">
        <div class="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="relative flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="w-5 h-5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full shadow-lg"></div>
              <div class="absolute inset-0 w-5 h-5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full animate-ping opacity-20"></div>
            </div>
            <div>
              <span class="text-base font-bold text-orange-700 dark:text-orange-300">High Risk</span>
              <p class="text-xs text-orange-600/80 dark:text-orange-400/80">Enhanced monitoring needed</p>
            </div>
          </div>
          <div class="text-right">
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-orange-900 dark:text-orange-100">31</span>
              <span class="text-lg font-bold text-orange-700 dark:text-orange-300">%</span>
            </div>
            <p class="text-sm text-orange-600 dark:text-orange-400 font-semibold">78 addresses</p>
          </div>
        </div>
      </div>
      
      <!-- Medium Risk -->
      <div class="group relative overflow-hidden bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 p-5 hover:shadow-lg transition-all duration-300">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="relative flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="w-5 h-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-lg"></div>
              <div class="absolute inset-0 w-5 h-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full animate-ping opacity-20"></div>
            </div>
            <div>
              <span class="text-base font-bold text-emerald-700 dark:text-emerald-300">Medium Risk</span>
              <p class="text-xs text-emerald-600/80 dark:text-emerald-400/80">Standard compliance level</p>
            </div>
          </div>
          <div class="text-right">
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-emerald-900 dark:text-emerald-100">46</span>
              <span class="text-lg font-bold text-emerald-700 dark:text-emerald-300">%</span>
            </div>
            <p class="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">115 addresses</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Risk Trend Chart -->
    <div class="relative bg-gradient-to-br from-white via-emerald-50/50 to-green-50/30 dark:from-gray-800/80 dark:via-emerald-950/30 dark:to-green-950/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30 p-6 backdrop-blur-sm">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 rounded-2xl"></div>
      
      <div class="relative">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h4 class="text-lg font-bold text-emerald-800 dark:text-emerald-200">Risk Trend Analysis</h4>
            <p class="text-sm text-emerald-600 dark:text-emerald-400">6-month compliance overview</p>
          </div>
          <div class="flex items-center gap-6 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-sm"></div>
              <span class="text-gray-700 dark:text-gray-300 font-medium">Critical</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full shadow-sm"></div>
              <span class="text-gray-700 dark:text-gray-300 font-medium">High</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-sm"></div>
              <span class="text-gray-700 dark:text-gray-300 font-medium">Medium</span>
            </div>
          </div>
        </div>
        
        <div class="h-40 relative bg-gradient-to-b from-white/50 to-emerald-50/30 dark:from-gray-900/50 dark:to-emerald-950/20 rounded-xl border border-emerald-200/30 dark:border-emerald-700/20 p-4">
          <svg class="w-full h-full" viewBox="0 0 280 80" preserveAspectRatio="none">
            <!-- Enhanced Grid -->
            <defs>
              <pattern id="sigmaverde-grid" width="56" height="20" patternUnits="userSpaceOnUse">
                <path d="M 56 0 L 0 0 0 20" fill="none" stroke="rgba(16, 185, 129, 0.1)" stroke-width="1"/>
              </pattern>
              <linearGradient id="criticalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgba(239, 68, 68, 0.2);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgba(239, 68, 68, 0.05);stop-opacity:1" />
              </linearGradient>
              <linearGradient id="highGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgba(249, 115, 22, 0.2);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgba(249, 115, 22, 0.05);stop-opacity:1" />
              </linearGradient>
              <linearGradient id="mediumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgba(16, 185, 129, 0.2);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgba(16, 185, 129, 0.05);stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#sigmaverde-grid)" />
            
            <!-- Enhanced Area Charts -->
            <path 
              :d="`${createPath(trendData, 'medium')} L 280,80 L 0,80 Z`"
              fill="url(#mediumGradient)"
              stroke="none"
            />
            <path 
              :d="`${createPath(trendData, 'high')} L 280,80 L 0,80 Z`"
              fill="url(#highGradient)"
              stroke="none"
            />
            <path 
              :d="`${createPath(trendData, 'critical')} L 280,80 L 0,80 Z`"
              fill="url(#criticalGradient)"
              stroke="none"
            />
            
            <!-- Enhanced Trend Lines -->
            <path 
              :d="createPath(trendData, 'medium')"
              fill="none"
              stroke="url(#mediumLineGradient)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              filter="drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))"
            />
            <path 
              :d="createPath(trendData, 'high')"
              fill="none"
              stroke="url(#highLineGradient)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              filter="drop-shadow(0 2px 4px rgba(249, 115, 22, 0.3))"
            />
            <path 
              :d="createPath(trendData, 'critical')"
              fill="none"
              stroke="url(#criticalLineGradient)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              filter="drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))"
            />
            
            <!-- Additional Gradients for Lines -->
            <defs>
              <linearGradient id="criticalLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#f87171;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="highLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fb923c;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="mediumLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#34d399;stop-opacity:1" />
              </linearGradient>
            </defs>
            
            <!-- Enhanced Data Points -->
            <g v-for="(item, index) in trendData" :key="index">
              <!-- Critical points -->
              <circle 
                :cx="(index / (trendData.length - 1)) * 280"
                :cy="80 - (item.critical / 60) * 80"
                r="4"
                fill="#ef4444"
                stroke="#ffffff"
                stroke-width="2"
                class="hover:r-6 transition-all duration-300 cursor-pointer"
                filter="drop-shadow(0 2px 4px rgba(239, 68, 68, 0.4))"
              />
              <!-- High points -->
              <circle 
                :cx="(index / (trendData.length - 1)) * 280"
                :cy="80 - (item.high / 60) * 80"
                r="4"
                fill="#f97316"
                stroke="#ffffff"
                stroke-width="2"
                class="hover:r-6 transition-all duration-300 cursor-pointer"
                filter="drop-shadow(0 2px 4px rgba(249, 115, 22, 0.4))"
              />
              <!-- Medium points -->
              <circle 
                :cx="(index / (trendData.length - 1)) * 280"
                :cy="80 - (item.medium / 60) * 80"
                r="4"
                fill="#10b981"
                stroke="#ffffff"
                stroke-width="2"
                class="hover:r-6 transition-all duration-300 cursor-pointer"
                filter="drop-shadow(0 2px 4px rgba(16, 185, 129, 0.4))"
              />
            </g>
          </svg>
          
          <!-- Enhanced Axis Labels -->
          <div class="absolute -bottom-8 left-0 right-0 flex justify-between text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <span v-for="item in trendData" :key="item.month" class="px-2 py-1 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg">
              {{ item.month }}
            </span>
          </div>
          
          <!-- Enhanced Y-axis labels -->
          <div class="absolute -left-12 top-0 bottom-0 flex flex-col justify-between text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <span class="px-2 py-1 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg">60%</span>
            <span class="px-2 py-1 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg">40%</span>
            <span class="px-2 py-1 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg">20%</span>
            <span class="px-2 py-1 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg">0%</span>
          </div>
        </div>
        
        <!-- Enhanced Chart Summary -->
        <div class="mt-6 pt-4 border-t border-emerald-200/50 dark:border-emerald-700/30">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6 text-sm">
              <div class="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200/50 dark:border-red-800/30">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
                <span class="text-red-700 dark:text-red-300 font-semibold">Critical ↓2%</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200/50 dark:border-orange-800/30">
                <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
                <span class="text-orange-700 dark:text-orange-300 font-semibold">High ↑1%</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
                <span class="text-emerald-700 dark:text-emerald-300 font-semibold">Medium ↓1%</span>
              </div>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">Updated 2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional SigmaVerde Footer -->
    <div class="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div>
          <p class="text-sm font-bold text-emerald-800 dark:text-emerald-200">SigmaVerde Compliance Engine</p>
          <p class="text-xs text-emerald-600 dark:text-emerald-400">Powered by advanced risk analytics</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
          ACTIVE
        </div>
        <div class="px-3 py-1 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-700">
          251 Total Addresses
        </div>
      </div>
    </div>
  </div>
</template>

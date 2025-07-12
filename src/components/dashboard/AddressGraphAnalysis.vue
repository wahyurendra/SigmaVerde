<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transaction Flow Analysis</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Interactive network visualization</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- View Controls -->
        <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            v-for="view in viewModes"
            :key="view.id"
            @click="currentView = view.id"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              currentView === view.id
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            {{ view.label }}
          </button>
        </div>
        
        <!-- Depth Control -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Depth:</label>
          <select 
            v-model="analysisDepth"
            @change="updateGraphData"
            class="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="1">1 Hop</option>
            <option value="2">2 Hops</option>
            <option value="3">3 Hops</option>
            <option value="4">4 Hops</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Graph Container -->
    <div class="relative">
      <!-- Network Graph -->
      <div v-if="currentView === 'network'" class="h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          <svg
            ref="networkSvg"
            class="w-full h-full"
            @mousedown="startPan"
            @mousemove="handlePan"
            @mouseup="endPan"
            @wheel="handleZoom"
            style="user-select: none;"
          >
          <!-- Background Grid -->
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <!-- Graph Container with Transform -->
          <g :transform="`translate(${panX}, ${panY}) scale(${zoomLevel})`">
            <!-- Edges -->
            <g class="edges">
              <line
                v-for="edge in networkData.edges"
                :key="`${edge.source}-${edge.target}`"
                :x1="getNodePosition(edge.source).x"
                :y1="getNodePosition(edge.source).y"
                :x2="getNodePosition(edge.target).x"
                :y2="getNodePosition(edge.target).y"
                :stroke="getEdgeColor(edge.risk)"
                :stroke-width="getEdgeWidth(edge.amount)"
                :stroke-opacity="getEdgeOpacity(edge)"
                :class="[
                  'transition-all duration-300',
                  isEdgeHighlighted(edge) ? 'stroke-purple-500' : ''
                ]"
              />
              
              <!-- Edge Labels -->
              <text
                v-for="edge in networkData.edges"
                :key="`label-${edge.source}-${edge.target}`"
                :x="(getNodePosition(edge.source).x + getNodePosition(edge.target).x) / 2"
                :y="(getNodePosition(edge.source).y + getNodePosition(edge.target).y) / 2"
                text-anchor="middle"
                class="text-xs fill-gray-600 dark:fill-gray-400 pointer-events-none"
                dy="-5"
              >
                {{ formatAmount(edge.amount) }}
              </text>
            </g>
            
            <!-- Nodes -->
            <g class="nodes">
              <g
                v-for="node in networkData.nodes"
                :key="node.id"
                :transform="`translate(${getNodePosition(node.id).x}, ${getNodePosition(node.id).y})`"
                :class="[
                  'cursor-pointer',
                  isDragging && draggedNode?.id === node.id ? 'cursor-grabbing' : 'cursor-grab',
                  node.risk === 'Critical' ? 'critical-risk-node' : '',
                  node.id === selectedNode?.id ? 'selected-node' : ''
                ]"
                @mousedown="startNodeDrag(node, $event)"
                @click="selectNode(node, $event)"
                @mouseenter="showNodeTooltip(node, $event)"
                @mouseleave="hideNodeTooltip"
              >
                <!-- Node Glow Effect for High Risk -->
                <circle
                  v-if="node.risk === 'Critical' || node.risk === 'High'"
                  :r="getNodeSize(node.importance) + 8"
                  :fill="getNodeGlowColor(node.risk)"
                  opacity="0.3"
                  class="animate-pulse"
                />
                
                <!-- Node Circle -->
                <circle
                  :r="getNodeSize(node.importance)"
                  :fill="getNodeColor(node.type, node.risk)"
                :stroke="getNodeStrokeColor(node)"
                :stroke-width="getNodeStrokeWidth(node)"
                :class="[
                  'drop-shadow-lg transition-all duration-300',
                  node.risk === 'Critical' ? 'animate-pulse' : '',
                  node.highlighted ? 'ring-4 ring-purple-400' : '',
                  node.connected ? 'ring-2 ring-blue-300' : ''
                ]"
                />
                
                <!-- Node Icon (SVG) -->
                <g :transform="`scale(${getNodeIconScale(node.importance)})`">
                  <g v-html="getNodeIconSVG(node.type)" class="fill-white pointer-events-none"></g>
                </g>
                
                <!-- Node Label -->
                <text
                  :y="getNodeSize(node.importance) + 18"
                  text-anchor="middle"
                  :class="[
                    'text-xs font-medium pointer-events-none transition-all duration-300',
                    node.id === selectedNode?.id ? 'fill-purple-600 dark:fill-purple-400 font-semibold' : 'fill-gray-700 dark:fill-gray-300'
                  ]"
                >
                  {{ node.label }}
                </text>
                
                <!-- Risk Badge -->
                <g v-if="node.risk === 'Critical' || node.risk === 'High'" :transform="`translate(${getNodeSize(node.importance) - 8}, ${-getNodeSize(node.importance) + 8})`">
                  <circle r="8" :fill="getRiskBadgeColor(node.risk)" stroke="white" stroke-width="2"/>
                  <text text-anchor="middle" dy="0.35em" class="text-xs fill-white font-bold pointer-events-none">!</text>
                </g>
              </g>
            </g>
          </g>
        </svg>
        
        <!-- Zoom Controls -->
        <div class="absolute top-4 right-4 flex flex-col gap-2">
          <button
            @click="zoomIn"
            class="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
          <button
            @click="zoomOut"
            class="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path>
            </svg>
          </button>
          <button
            @click="resetView"
            class="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Sankey Flow Diagram -->
      <div v-else-if="currentView === 'flow'" class="h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative">
        <svg ref="sankeySvg" class="w-full h-full">
          <!-- Sankey Flow Paths -->
          <g class="sankey-links">
            <path
              v-for="(link, index) in sankeyData.links"
              :key="`link-${index}`"
              :d="generateSankeyPath(link)"
              :fill="getSankeyLinkColor(link.risk)"
              :opacity="0.6"
              class="transition-all duration-300 hover:opacity-0.8"
              @mouseenter="showSankeyTooltip(link, $event)"
              @mouseleave="hideSankeyTooltip"
            />
          </g>
          
          <!-- Sankey Nodes -->
          <g class="sankey-nodes">
            <g
              v-for="(node, index) in sankeyData.nodes"
              :key="`node-${index}`"
              :transform="`translate(${node.x}, ${node.y})`"
            >
              <rect
                :width="node.width"
                :height="node.height"
                :fill="getSankeyNodeColor(node.category)"
                rx="4"
                class="cursor-pointer transition-all duration-300 hover:brightness-110"
                @click="selectSankeyNode(node)"
              />
              <text
                :x="node.width / 2"
                :y="node.height / 2"
                text-anchor="middle"
                dy="0.35em"
                class="text-sm font-medium fill-white pointer-events-none"
              >
                {{ node.name }}
              </text>
              <text
                :x="node.width / 2"
                :y="node.height + 15"
                text-anchor="middle"
                class="text-xs fill-gray-600 dark:fill-gray-400 pointer-events-none"
              >
                {{ formatAmount(node.value) }} {{ addressData.crypto }}
              </text>
            </g>
          </g>
        </svg>
      </div>

      <!-- Timeline View -->
      <div v-else-if="currentView === 'timeline'" class="h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
        <svg ref="timelineSvg" class="w-full h-full">
          <!-- Timeline Axis -->
          <g class="timeline-axis">
            <line
              x1="50"
              y1="350"
              x2="750"
              y2="350"
              stroke="#6b7280"
              stroke-width="2"
            />
            
            <!-- Time Labels -->
            <g v-for="(tick, index) in timelineTicks" :key="`tick-${index}`">
              <line
                :x1="tick.x"
                y1="345"
                :x2="tick.x"
                y2="355"
                stroke="#6b7280"
                stroke-width="1"
              />
              <text
                :x="tick.x"
                y="370"
                text-anchor="middle"
                class="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {{ tick.label }}
              </text>
            </g>
          </g>
          
          <!-- Transaction Bubbles -->
          <g class="timeline-transactions">
            <g
              v-for="(tx, index) in timelineData"
              :key="`tx-${index}`"
              :transform="`translate(${tx.x}, ${tx.y})`"
              class="cursor-pointer transition-all duration-300 hover:scale-110"
              @click="selectTransaction(tx)"
              @mouseenter="showTimelineTooltip(tx, $event)"
              @mouseleave="hideTimelineTooltip"
            >
              <circle
                :r="tx.size"
                :fill="getTransactionColor(tx.type, tx.risk)"
                :stroke="tx.selected ? '#8b5cf6' : '#ffffff'"
                :stroke-width="tx.selected ? 3 : 2"
                class="drop-shadow-sm"
              />
              <text
                text-anchor="middle"
                dy="0.35em"
                class="text-xs fill-white font-bold pointer-events-none"
              >
                {{ tx.type === 'incoming' ? '↓' : '↑' }}
              </text>
            </g>
          </g>
        </svg>
      </div>

      <!-- Heatmap View -->
      <div v-else-if="currentView === 'heatmap'" class="h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative">
        <div class="grid grid-cols-24 grid-rows-7 gap-1 p-4 h-full">
          <div
            v-for="(cell, index) in heatmapData"
            :key="`cell-${index}`"
            :class="[
              'rounded-sm transition-all duration-300 cursor-pointer hover:scale-110',
              getHeatmapCellColor(cell.intensity)
            ]"
            :title="`${cell.day} ${cell.hour}:00 - ${cell.transactions} transactions`"
            @click="selectHeatmapCell(cell)"
          >
          </div>
        </div>
        <!-- Heatmap Legend -->
        <div class="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-600">
          <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Level</div>
          <div class="flex items-center gap-1">
            <span class="text-xs text-gray-500 dark:text-gray-400">Low</span>
            <div class="flex gap-1">
              <div class="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <div class="w-3 h-3 bg-green-200 dark:bg-green-800 rounded-sm"></div>
              <div class="w-3 h-3 bg-green-400 dark:bg-green-600 rounded-sm"></div>
              <div class="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm"></div>
              <div class="w-3 h-3 bg-green-800 dark:bg-green-400 rounded-sm"></div>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">High</span>
          </div>
        </div>
        
        <!-- Heatmap Time Labels -->
        <div class="absolute left-2 top-4 flex flex-col justify-between h-80 text-xs text-gray-500 dark:text-gray-400">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>
        
        <div class="absolute bottom-16 left-8 right-8 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>

    <!-- Node/Transaction Details Panel -->
    <div v-if="selectedNode || selectedTransaction" class="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <!-- Node Details -->
      <div v-if="selectedNode" class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ selectedNode.label }}</h4>
          <button
            @click="clearSelection"
            class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div class="text-sm text-gray-500 dark:text-gray-400">Address</div>
            <div class="font-mono text-sm text-gray-900 dark:text-white break-all">{{ selectedNode.address }}</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div class="text-sm text-gray-500 dark:text-gray-400">Risk Level</div>
            <div class="flex items-center gap-2">
              <span :class="getRiskBadgeClass(selectedNode.risk)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ selectedNode.risk }}
              </span>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div class="text-sm text-gray-500 dark:text-gray-400">Total Volume</div>
            <div class="font-semibold text-gray-900 dark:text-white">{{ formatAmount(selectedNode.totalVolume) }} {{ addressData.crypto }}</div>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in selectedNode.tags"
            :key="tag"
            class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Transaction Details -->
      <div v-if="selectedTransaction" class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Transaction Details</h4>
          <button
            @click="clearSelection"
            class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div class="text-sm text-gray-500 dark:text-gray-400">Hash</div>
            <div class="font-mono text-xs text-gray-900 dark:text-white break-all">{{ selectedTransaction.hash }}</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div class="text-sm text-gray-500 dark:text-gray-400">Amount</div>
            <div class="font-semibold text-gray-900 dark:text-white">{{ formatAmount(selectedTransaction.amount) }} {{ addressData.crypto }}</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div class="text-sm text-gray-500 dark:text-gray-400">Type</div>
            <div :class="selectedTransaction.type === 'incoming' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="font-medium">
              {{ selectedTransaction.type === 'incoming' ? '↓ Received' : '↑ Sent' }}
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div class="text-sm text-gray-500 dark:text-gray-400">Timestamp</div>
            <div class="text-sm text-gray-900 dark:text-white">{{ selectedTransaction.timestamp }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Graph Statistics -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">Total Nodes</div>
            <div class="text-2xl font-bold">{{ networkData.nodes.length }}</div>
          </div>
          <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
      </div>
      
      <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">Connections</div>
            <div class="text-2xl font-bold">{{ networkData.edges.length }}</div>
          </div>
          <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
        </div>
      </div>
      
      <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">High Risk</div>
            <div class="text-2xl font-bold">{{ highRiskCount }}</div>
          </div>
          <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
      </div>
      
      <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">Total Volume</div>
            <div class="text-2xl font-bold">{{ formatAmount(totalVolume) }}</div>
          </div>
          <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.show"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      class="fixed z-50 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg pointer-events-none max-w-xs"
    >
      <div class="font-medium">{{ tooltip.title }}</div>
      <div class="text-gray-300 mt-1">{{ tooltip.content }}</div>
    </div>
  </div>
</template>

<script>
import { computed, nextTick, onMounted, ref } from 'vue'

export default {
  name: 'AddressGraphAnalysis',
  props: {
    addressData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    // Reactive state
    const currentView = ref('network')
    const analysisDepth = ref('2')
    const selectedNode = ref(null)
    const selectedTransaction = ref(null)
    
    // Graph interaction state
    const panX = ref(0)
    const panY = ref(0)
    const zoomLevel = ref(1)
    const isPanning = ref(false)
    const lastPanPoint = ref({ x: 0, y: 0 })
    
    // Node dragging state
    const isDragging = ref(false)
    const draggedNode = ref(null)
    const dragOffset = ref({ x: 0, y: 0 })
    const lastDragPoint = ref({ x: 0, y: 0 })
    
    // Tooltip state
    const tooltip = ref({
      show: false,
      x: 0,
      y: 0,
      title: '',
      content: ''
    })
    
    // View modes
    const viewModes = ref([
      { id: 'network', label: 'Network' },
      { id: 'flow', label: 'Flow' },
      { id: 'timeline', label: 'Timeline' },
      { id: 'heatmap', label: 'Heatmap' }
    ])

    // Network data
    const networkData = ref({
      nodes: [
        {
          id: 'center',
          label: 'Target Address',
          type: 'target',
          risk: 'Low',
          importance: 1.0,
          address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
          totalVolume: 89.12345678,
          tags: ['Exchange', 'KYC Verified']
        },
        {
          id: 'mixer1',
          label: 'ChipMixer',
          type: 'mixer',
          risk: 'Critical',
          importance: 0.6,
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          totalVolume: 45.67890123,
          tags: ['Mixing Service', 'Privacy']
        },
        {
          id: 'wallet1',
          label: 'Personal Wallet',
          type: 'wallet',
          risk: 'Low',
          importance: 0.4,
          address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
          totalVolume: 23.45678901,
          tags: ['Personal Wallet']
        },
        {
          id: 'darknet1',
          label: 'Silk Road',
          type: 'darknet',
          risk: 'Critical',
          importance: 0.7,
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          totalVolume: 156.78901234,
          tags: ['Darknet Market', 'Sanctioned']
        },
        {
          id: 'exchange1',
          label: 'Binance',
          type: 'exchange',
          risk: 'Low',
          importance: 0.8,
          address: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
          totalVolume: 234.56789012,
          tags: ['Exchange', 'Regulated']
        },
        {
          id: 'defi1',
          label: 'Uniswap',
          type: 'defi',
          risk: 'Medium',
          importance: 0.5,
          address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
          totalVolume: 78.90123456,
          tags: ['DeFi Protocol', 'DEX']
        }
      ],
      edges: [
        { source: 'center', target: 'exchange1', amount: 45.67890123, risk: 'Low' },
        { source: 'center', target: 'mixer1', amount: 23.45678901, risk: 'Critical' },
        { source: 'center', target: 'wallet1', amount: 12.34567890, risk: 'Low' },
        { source: 'mixer1', target: 'darknet1', amount: 15.67890123, risk: 'Critical' },
        { source: 'exchange1', target: 'defi1', amount: 34.56789012, risk: 'Medium' },
        { source: 'wallet1', target: 'exchange1', amount: 8.90123456, risk: 'Low' }
      ]
    })

    // Sankey data
    const sankeyData = ref({
      nodes: [
        { name: 'Exchanges', x: 50, y: 50, width: 120, height: 60, value: 234.56, category: 'source' },
        { name: 'Personal Wallets', x: 50, y: 150, width: 120, height: 40, value: 123.45, category: 'source' },
        { name: 'Target Address', x: 300, y: 100, width: 140, height: 80, value: 357.01, category: 'target' },
        { name: 'Mixing Services', x: 550, y: 50, width: 120, height: 50, value: 89.12, category: 'suspicious' },
        { name: 'DeFi Protocols', x: 550, y: 150, width: 120, height: 60, value: 145.67, category: 'medium' },
        { name: 'Unknown', x: 550, y: 250, width: 100, height: 40, value: 67.89, category: 'high-risk' }
      ],
      links: [
        { source: 0, target: 2, value: 234.56, risk: 'Low' },
        { source: 1, target: 2, value: 123.45, risk: 'Medium' },
        { source: 2, target: 3, value: 89.12, risk: 'Critical' },
        { source: 2, target: 4, value: 145.67, risk: 'Medium' },
        { source: 2, target: 5, value: 67.89, risk: 'High' }
      ]
    })

    // Timeline data
    const timelineData = ref([
      {
        hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        type: 'incoming',
        amount: 25.67890123,
        risk: 'Low',
        timestamp: '2024-01-15 10:30:00',
        x: 150,
        y: 200,
        size: 12,
        selected: false
      },
      {
        hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1',
        type: 'outgoing',
        amount: 15.87654321,
        risk: 'Critical',
        timestamp: '2024-01-15 14:45:00',
        x: 300,
        y: 150,
        size: 18,
        selected: false
      },
      {
        hash: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2',
        type: 'incoming',
        amount: 5.00000000,
        risk: 'Medium',
        timestamp: '2024-01-16 09:15:00',
        x: 450,
        y: 250,
        size: 10,
        selected: false
      },
      {
        hash: 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3',
        type: 'outgoing',
        amount: 89.12345678,
        risk: 'High',
        timestamp: '2024-01-16 16:20:00',
        x: 600,
        y: 100,
        size: 25,
        selected: false
      }
    ])

    // Timeline ticks
    const timelineTicks = ref([
      { x: 100, label: 'Jan 15' },
      { x: 250, label: 'Jan 16' },
      { x: 400, label: 'Jan 17' },
      { x: 550, label: 'Jan 18' },
      { x: 700, label: 'Jan 19' }
    ])

    // Heatmap data (24 hours x 7 days)
    const heatmapData = ref([])

    // Node positions for network graph
    const nodePositions = ref({
      center: { x: 400, y: 200 },
      exchange1: { x: 200, y: 100 },
      mixer1: { x: 600, y: 100 },
      wallet1: { x: 200, y: 300 },
      darknet1: { x: 600, y: 300 },
      defi1: { x: 400, y: 350 }
    })

    // Computed properties
    const highRiskCount = computed(() => {
      return networkData.value.nodes.filter(node => 
        node.risk === 'High' || node.risk === 'Critical'
      ).length
    })

    const totalVolume = computed(() => {
      return networkData.value.nodes.reduce((sum, node) => sum + node.totalVolume, 0)
    })

    // Methods
    const updateGraphData = () => {
      console.log(`Analysis depth set to ${analysisDepth.value} hops`)
    }

    const getNodePosition = (nodeId) => {
      return nodePositions.value[nodeId] || { x: 0, y: 0 }
    }

    const getNodeSize = (importance) => {
      return 15 + (importance * 20)
    }

    const getNodeColor = (type, risk) => {
      const typeColors = {
        target: '#8b5cf6',
        exchange: '#3b82f6',
        mixer: '#ef4444',
        wallet: '#10b981',
        darknet: '#dc2626',
        defi: '#f59e0b'
      }
      
      return typeColors[type] || '#6b7280'
    }

    const getNodeIconSVG = (type) => {
      const icons = {
        target: `<circle cx="0" cy="0" r="3" fill="currentColor"/><circle cx="0" cy="0" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="0" cy="0" r="9" fill="none" stroke="currentColor" stroke-width="1"/>`,
        exchange: `<rect x="-6" y="-4" width="12" height="8" rx="1" fill="currentColor"/><rect x="-4" y="-6" width="8" height="3" rx="0.5" fill="currentColor"/><circle cx="-2" cy="0" r="1" fill="white"/><circle cx="2" cy="0" r="1" fill="white"/>`,
        mixer: `<circle cx="0" cy="0" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M-4,-4 Q0,0 4,-4 Q0,0 -4,4 Q0,0 4,4 Q0,0 -4,-4" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
        wallet: `<rect x="-6" y="-3" width="12" height="6" rx="1" fill="currentColor"/><rect x="-5" y="-2" width="10" height="1" fill="white"/><circle cx="3" cy="0" r="1" fill="white"/>`,
        darknet: `<circle cx="0" cy="0" r="8" fill="currentColor"/><circle cx="0" cy="0" r="5" fill="black"/><circle cx="0" cy="0" r="2" fill="currentColor"/>`,
        defi: `<polygon points="-6,-6 6,-6 4,-2 8,2 0,8 -8,2 -4,-2" fill="currentColor"/><circle cx="0" cy="0" r="2" fill="white"/>`
      }
      return icons[type] || `<circle cx="0" cy="0" r="6" fill="currentColor"/><text text-anchor="middle" dy="0.35em" class="text-xs fill-white">?</text>`
    }

    const getNodeIconScale = (importance) => {
      return 0.8 + (importance * 0.4)
    }

    const getNodeStrokeColor = (node) => {
      if (node.id === selectedNode.value?.id) return '#8b5cf6'
      if (node.risk === 'Critical') return '#ef4444'
      if (node.risk === 'High') return '#f97316'
      return '#ffffff'
    }

    const getNodeStrokeWidth = (node) => {
      if (node.id === selectedNode.value?.id) return 4
      if (node.risk === 'Critical' || node.risk === 'High') return 3
      return 2
    }

    const getNodeGlowColor = (risk) => {
      const colors = {
        Critical: '#ef4444',
        High: '#f97316'
      }
      return colors[risk] || '#6b7280'
    }

    const getRiskBadgeColor = (risk) => {
      const colors = {
        Critical: '#dc2626',
        High: '#ea580c'
      }
      return colors[risk] || '#6b7280'
    }

    const getEdgeColor = (risk) => {
      const colors = {
        Low: '#10b981',
        Medium: '#f59e0b',
        High: '#f97316',
        Critical: '#ef4444'
      }
      return colors[risk] || '#6b7280'
    }

    const getEdgeWidth = (amount) => {
      return Math.max(1, Math.min(8, amount / 10))
    }

    const getEdgeOpacity = (edge) => {
      if (selectedNode.value) {
        return isEdgeHighlighted(edge) ? 1 : 0.2
      }
      return 0.6
    }

    const isEdgeHighlighted = (edge) => {
      if (!selectedNode.value) return false
      return edge.source === selectedNode.value.id || edge.target === selectedNode.value.id
    }

    const selectNode = (node, event) => {
      // Prevent selection during drag operations
      if (isDragging.value) return
      
      // Toggle selection if clicking the same node
      if (selectedNode.value?.id === node.id) {
        selectedNode.value = null
        return
      }
      
      // Select the new node
      selectedNode.value = node
      selectedTransaction.value = null
      
      // Emit selection event for parent components
      // emit('node-selected', node)
      
      // Optional: Center the view on the selected node
      if (event?.shiftKey) {
        centerViewOnNode(node)
      }
      
      // Optional: Highlight connected nodes
      highlightConnectedNodes(node.id)
      
      // Log selection for debugging/analytics
      console.log(`Node selected: ${node.label} (${node.type}, Risk: ${node.risk})`)
    }

    const centerViewOnNode = (node) => {
      const nodePos = getNodePosition(node.id)
      const svgRect = document.querySelector('svg')?.getBoundingClientRect()
      
      if (svgRect) {
        const centerX = svgRect.width / 2
        const centerY = svgRect.height / 2
        
        panX.value = centerX - (nodePos.x * zoomLevel.value)
        panY.value = centerY - (nodePos.y * zoomLevel.value)
      }
    }

    const highlightConnectedNodes = (nodeId) => {
      // Reset all highlights first
      networkData.value.nodes.forEach(node => {
        node.highlighted = false
        node.connected = false
      })
      
      // Highlight the selected node
      const selectedNodeData = networkData.value.nodes.find(n => n.id === nodeId)
      if (selectedNodeData) {
        selectedNodeData.highlighted = true
      }
      
      // Find and highlight connected nodes
      const connectedNodeIds = new Set()
      networkData.value.edges.forEach(edge => {
        if (edge.source === nodeId) {
          connectedNodeIds.add(edge.target)
        } else if (edge.target === nodeId) {
          connectedNodeIds.add(edge.source)
        }
      })
      
      // Mark connected nodes
      networkData.value.nodes.forEach(node => {
        if (connectedNodeIds.has(node.id)) {
          node.connected = true
        }
      })
    }

    const selectTransaction = (transaction) => {
      selectedTransaction.value = transaction
      selectedNode.value = null
      
      // Update selection state
      timelineData.value.forEach(tx => {
        tx.selected = tx.hash === transaction.hash
      })
    }

    const clearSelection = () => {
      selectedNode.value = null
      selectedTransaction.value = null
      timelineData.value.forEach(tx => {
        tx.selected = false
      })
      
      // Clear node highlights
      networkData.value.nodes.forEach(node => {
        node.highlighted = false
        node.connected = false
      })
    }

    // Graph interaction methods
    const startPan = (event) => {
      if (isDragging.value) return // Don't pan while dragging a node
      isPanning.value = true
      lastPanPoint.value = { x: event.clientX, y: event.clientY }
    }

    const handlePan = (event) => {
      if (isDragging.value) {
        handleNodeDrag(event)
        return
      }
      
      if (!isPanning.value) return
      
      const deltaX = event.clientX - lastPanPoint.value.x
      const deltaY = event.clientY - lastPanPoint.value.y
      
      panX.value += deltaX
      panY.value += deltaY
      
      lastPanPoint.value = { x: event.clientX, y: event.clientY }
    }

    const endPan = () => {
      if (isDragging.value) {
        endNodeDrag()
        return
      }
      isPanning.value = false
    }

    // Node dragging methods
    const startNodeDrag = (node, event) => {
      event.stopPropagation() // Prevent triggering pan
      isDragging.value = true
      draggedNode.value = node
      
      const svg = event.currentTarget.closest('svg')
      const rect = svg.getBoundingClientRect()
      const nodePos = getNodePosition(node.id)
      
      // Simple coordinate calculation
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      // Transform mouse coordinates to graph space
      const graphMouseX = (mouseX - panX.value) / zoomLevel.value
      const graphMouseY = (mouseY - panY.value) / zoomLevel.value
      
      // Store offset from mouse to node center
      dragOffset.value = {
        x: graphMouseX - nodePos.x,
        y: graphMouseY - nodePos.y
      }
      
      // Add global event listeners
      document.addEventListener('mousemove', handleNodeDrag)
      document.addEventListener('mouseup', endNodeDrag)
    }

    const handleNodeDrag = (event) => {
      if (!isDragging.value || !draggedNode.value) return
      
      const svg = document.querySelector('svg')
      if (!svg) return
      
      const rect = svg.getBoundingClientRect()
      
      // Get current mouse position
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      // Transform to graph coordinates
      const graphMouseX = (mouseX - panX.value) / zoomLevel.value
      const graphMouseY = (mouseY - panY.value) / zoomLevel.value
      
      // Calculate new node position
      const newX = graphMouseX - dragOffset.value.x
      const newY = graphMouseY - dragOffset.value.y
      
      // Apply constraints to keep node within bounds
      const margin = 50
      const constrainedX = Math.max(margin, Math.min(800 - margin, newX))
      const constrainedY = Math.max(margin, Math.min(400 - margin, newY))
      
      // Update node position
      nodePositions.value[draggedNode.value.id] = {
        x: constrainedX,
        y: constrainedY
      }
    }

    const endNodeDrag = () => {
      isDragging.value = false
      draggedNode.value = null
      dragOffset.value = { x: 0, y: 0 }
      
      // Remove global event listeners
      document.removeEventListener('mousemove', handleNodeDrag)
      document.removeEventListener('mouseup', endNodeDrag)
    }

    const handleZoom = (event) => {
      event.preventDefault()
      const delta = event.deltaY > 0 ? 0.9 : 1.1
      zoomLevel.value = Math.max(0.1, Math.min(3, zoomLevel.value * delta))
    }

    const zoomIn = () => {
      zoomLevel.value = Math.min(3, zoomLevel.value * 1.2)
    }

    const zoomOut = () => {
      zoomLevel.value = Math.max(0.1, zoomLevel.value * 0.8)
    }

    const resetView = () => {
      panX.value = 0
      panY.value = 0
      zoomLevel.value = 1
    }

    // Sankey methods
    const generateSankeyPath = (link) => {
      const source = sankeyData.value.nodes[link.source]
      const target = sankeyData.value.nodes[link.target]
      
      const x0 = source.x + source.width
      const x1 = target.x
      const xi = (x0 + x1) / 2
      const y0 = source.y + source.height / 2
      const y1 = target.y + target.height / 2
      
      return `M${x0},${y0}C${xi},${y0} ${xi},${y1} ${x1},${y1}`
    }

    const getSankeyLinkColor = (risk) => {
      const colors = {
        Low: '#10b981',
        Medium: '#f59e0b',
        High: '#f97316',
        Critical: '#ef4444'
      }
      return colors[risk] || '#6b7280'
    }

    const getSankeyNodeColor = (category) => {
      const colors = {
        source: '#3b82f6',
        target: '#8b5cf6',
        suspicious: '#ef4444',
        medium: '#f59e0b',
        'high-risk': '#dc2626'
      }
      return colors[category] || '#6b7280'
    }

    const selectSankeyNode = (node) => {
      console.log(`Node Selected: ${node.name}: ${formatAmount(node.value)} ${props.addressData.crypto}`)
    }

    // Timeline methods
    const getTransactionColor = (type, risk) => {
      const baseColors = {
        incoming: '#10b981',
        outgoing: '#ef4444'
      }
      
      return baseColors[type]
    }

    // Heatmap methods
    const generateHeatmapData = () => {
      const data = []
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          data.push({
            day: days[day],
            hour,
            transactions: Math.floor(Math.random() * 20),
            intensity: Math.random()
          })
        }
      }
      
      return data
    }

    const getHeatmapCellColor = (intensity) => {
      if (intensity === 0) return 'bg-gray-200 dark:bg-gray-700'
      if (intensity < 0.2) return 'bg-green-200 dark:bg-green-800'
      if (intensity < 0.4) return 'bg-green-300 dark:bg-green-700'
      if (intensity < 0.6) return 'bg-green-400 dark:bg-green-600'
      if (intensity < 0.8) return 'bg-green-500 dark:bg-green-500'
      return 'bg-green-600 dark:bg-green-400'
    }

    const selectHeatmapCell = (cell) => {
      console.log(`Time Period Selected: ${cell.day} ${cell.hour}:00 - ${cell.transactions} transactions`)
    }

    // Tooltip methods
    const showNodeTooltip = (node, event) => {
      tooltip.value = {
        show: true,
        x: event.clientX + 10,
        y: event.clientY - 10,
        title: node.label,
        content: `Risk: ${node.risk} | Volume: ${formatAmount(node.totalVolume)} ${props.addressData.crypto}`
      }
    }

    const showSankeyTooltip = (link, event) => {
      const source = sankeyData.value.nodes[link.source]
      const target = sankeyData.value.nodes[link.target]
      
      tooltip.value = {
        show: true,
        x: event.clientX + 10,
        y: event.clientY - 10,
        title: `${source.name} → ${target.name}`,
        content: `Amount: ${formatAmount(link.value)} ${props.addressData.crypto} | Risk: ${link.risk}`
      }
    }

    const showTimelineTooltip = (transaction, event) => {
      tooltip.value = {
        show: true,
        x: event.clientX + 10,
        y: event.clientY - 10,
        title: `${transaction.type === 'incoming' ? 'Received' : 'Sent'} Transaction`,
        content: `Amount: ${formatAmount(transaction.amount)} ${props.addressData.crypto} | ${transaction.timestamp}`
      }
    }

    const hideNodeTooltip = () => {
      tooltip.value.show = false
    }

    const hideSankeyTooltip = () => {
      tooltip.value.show = false
    }

    const hideTimelineTooltip = () => {
      tooltip.value.show = false
    }

    // Utility methods
    const formatAmount = (amount) => {
      if (typeof amount !== 'number') return '0.00000000'
      return amount.toFixed(8)
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

    // Lifecycle
    onMounted(() => {
      heatmapData.value = generateHeatmapData()
      
      // Initialize graph layout
      nextTick(() => {
        // Any additional initialization can go here
      })
    })

    return {
      // Reactive state
      currentView,
      analysisDepth,
      selectedNode,
      selectedTransaction,
      panX,
      panY,
      zoomLevel,
      isPanning,
      lastPanPoint,
      isDragging,
      draggedNode,
      dragOffset,
      lastDragPoint,
      tooltip,
      viewModes,
      networkData,
      sankeyData,
      timelineData,
      timelineTicks,
      heatmapData,
      nodePositions,
      
      // Computed
      highRiskCount,
      totalVolume,
      
      // Methods
      updateGraphData,
      getNodePosition,
      getNodeSize,
      getNodeColor,
      getNodeIconSVG,
      getNodeIconScale,
      getNodeStrokeColor,
      getNodeStrokeWidth,
      getNodeGlowColor,
      getRiskBadgeColor,
      getEdgeColor,
      getEdgeWidth,
      getEdgeOpacity,
      isEdgeHighlighted,
      selectNode,
      centerViewOnNode,
      highlightConnectedNodes,
      selectTransaction,
      clearSelection,
      startPan,
      handlePan,
      endPan,
      startNodeDrag,
      handleNodeDrag,
      endNodeDrag,
      handleZoom,
      zoomIn,
      zoomOut,
      resetView,
      generateSankeyPath,
      getSankeyLinkColor,
      getSankeyNodeColor,
      selectSankeyNode,
      getTransactionColor,
      generateHeatmapData,
      getHeatmapCellColor,
      selectHeatmapCell,
      showNodeTooltip,
      showSankeyTooltip,
      showTimelineTooltip,
      hideNodeTooltip,
      hideSankeyTooltip,
      hideTimelineTooltip,
      formatAmount,
      getRiskBadgeClass
    }
  }
}
</script>

<style scoped>
/* Graph container styling */
.graph-container {
  position: relative;
  overflow: hidden;
}

/* SVG styling */
svg {
  cursor: grab;
  user-select: none;
}

svg:active {
  cursor: grabbing;
}

/* Node animations */
.nodes g {
  transition: all 0.3s ease;
}

.nodes g:hover {
  filter: brightness(1.1);
}

/* Edge animations */
.edges line {
  transition: all 0.3s ease;
}

.edges line:hover {
  stroke-opacity: 1 !important;
  stroke-width: 4px !important;
}

/* Timeline styling */
.timeline-transactions g {
  transition: all 0.3s ease;
}

.timeline-transactions g:hover {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

/* Sankey styling */
.sankey-links path {
  transition: all 0.3s ease;
}

.sankey-links path:hover {
  opacity: 0.9 !important;
  stroke: #ffffff;
  stroke-width: 1px;
}

.sankey-nodes rect {
  transition: all 0.3s ease;
}

.sankey-nodes rect:hover {
  filter: brightness(1.2);
}

/* Heatmap styling */
.grid > div {
  transition: all 0.2s ease;
}

.grid > div:hover {
  transform: scale(1.1);
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Zoom controls */
.zoom-controls button {
  transition: all 0.2s ease;
}

.zoom-controls button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Statistics cards */
.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Selection panel */
.selection-panel {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tooltip styling */
.tooltip {
  animation: tooltipFadeIn 0.2s ease-out;
  backdrop-filter: blur(4px);
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Graph grid pattern */
#grid path {
  transition: stroke 0.3s ease;
}

.dark #grid path {
  stroke: #374151;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid-cols-1.md\\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .grid-cols-1.md\\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .h-96 {
    height: 20rem;
  }
  
  .grid-cols-1.md\\:grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .text-2xl {
    font-size: 1.5rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
  
  .gap-6 {
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .flex.items-center.gap-3 {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .grid-cols-24 {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  
  .absolute.bottom-16.left-8.right-8 {
    left: 1rem;
    right: 1rem;
  }
}

/* Print styles */
@media print {
  .absolute {
    position: static !important;
  }
  
  .fixed {
    position: static !important;
  }
  
  .bg-gradient-to-r {
    background: #6b7280 !important;
    -webkit-print-color-adjust: exact;
  }
  
  svg {
    background: white !important;
  }
  
  .tooltip {
    display: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .bg-gray-50 {
    background-color: white;
  }
  
  .dark .bg-gray-900 {
    background-color: black;
  }
  
  .border-gray-200 {
    border-color: #000;
  }
  
  .dark .border-gray-700 {
    border-color: #fff;
  }
  
  svg line,
  svg path,
  svg circle {
    stroke: #000 !important;
  }
  
  .dark svg line,
  .dark svg path,
  .dark svg circle {
    stroke: #fff !important;
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

/* Focus indicators for accessibility */
button:focus-visible,
select:focus-visible {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}

/* Custom scrollbar for selection panel */
.selection-panel::-webkit-scrollbar {
  width: 6px;
}

.selection-panel::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.selection-panel::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dark .selection-panel::-webkit-scrollbar-track {
  background: #374151;
}

.dark .selection-panel::-webkit-scrollbar-thumb {
  background: #6b7280;
}

/* Enhanced visual effects */
.graph-glow {
  filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.3));
}

.risk-critical {
  animation: riskPulse 2s ease-in-out infinite;
}

@keyframes riskPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Interactive elements enhancement */
.interactive-element {
  transition: all 0.2s ease;
}

.interactive-element:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.interactive-element:active {
  transform: scale(0.98);
}

/* Loading states */
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.dark .loading-shimmer {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
}

/* Graph legend */
.graph-legend {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .graph-legend {
  background: rgba(31, 41, 55, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Enhanced button styles */
.btn-graph {
  position: relative;
  overflow: hidden;
}

.btn-graph::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-graph:hover::before {
  left: 100%;
}

/* Network analysis specific styles */
.network-node {
  cursor: grab;
  transition: all 0.3s ease;
}

.network-node:hover {
  filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.4));
}

.network-node:active {
  cursor: grabbing;
}

.network-edge {
  transition: all 0.3s ease;
}

.network-edge:hover {
  stroke-width: 4px !important;
  stroke-opacity: 1 !important;
}

/* Enhanced node styling */
.nodes g {
  transition: filter 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nodes g:hover {
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.3));
}

.nodes g.cursor-grabbing {
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
}

/* Node risk-based styling */
.nodes g circle {
  transition: stroke-width 0.3s ease, stroke 0.3s ease;
}

.nodes g:hover circle {
  stroke-width: 3px !important;
}

/* Dragging state styles */
.cursor-grabbing {
  cursor: grabbing !important;
}

.cursor-grab {
  cursor: grab !important;
}

.cursor-grab:hover {
  cursor: grab !important;
}

/* Flow diagram enhancements */
.flow-path {
  stroke-dasharray: 5,5;
  animation: flowAnimation 2s linear infinite;
}

@keyframes flowAnimation {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 10;
  }
}

/* Timeline enhancements */
.timeline-marker {
  transition: all 0.3s ease;
}

.timeline-marker:hover {
  r: 8;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.4));
}

/* Heatmap enhancements */
.heatmap-cell {
  transition: all 0.2s ease;
  cursor: pointer;
}

.heatmap-cell:hover {
  transform: scale(1.2);
  z-index: 10;
  border-radius: 0.25rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Animation for critical risk nodes */
.critical-risk-node {
  animation: criticalPulse 2s ease-in-out infinite;
}

@keyframes criticalPulse {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(239, 68, 68, 1));
  }
}

/* Enhanced critical node glow */
.critical-risk-node circle:first-child {
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.1);
  }
}

/* High risk edge animation */
.high-risk-edge {
  stroke-dasharray: 3,3;
  animation: riskFlow 1s linear infinite;
}

@keyframes riskFlow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 6;
  }
}

/* Graph statistics card hover effects */
.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Selection highlight animation */
.selected-node {
  animation: selectionGlow 1.5s ease-in-out infinite;
}

@keyframes selectionGlow {
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.7));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(139, 92, 246, 1));
  }
}

/* Node interaction feedback */
.nodes g:active {
  transform: scale(1.05);
}

/* Smooth position transitions for non-dragged nodes */
.nodes g:not(.cursor-grabbing) {
  transition: none;
}

/* Enhanced hover effects */
.nodes g:hover text {
  font-weight: 600;
}

/* Risk badge styling */
.nodes g circle[stroke="white"] {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Icon scaling - removed conflicting transform */
.nodes g g[transform*="scale"] {
  transition: none;
}

/* Tooltip arrow */
.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 20px;
  border: 5px solid transparent;
  border-top-color: #1f2937;
}

/* Loading skeleton for graph */
.graph-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Dark mode skeleton */
.dark .graph-skeleton {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
}

/* Accessibility improvements */
.sr-only {
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

/* Focus trap for modal-like interactions */
.focus-trap:focus {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}

/* Enhanced grid pattern for better visibility */
.graph-grid {
  opacity: 0.1;
  transition: opacity 0.3s ease;
}

.graph-container:hover .graph-grid {
  opacity: 0.2;
}

/* Smooth transitions for view switching */
.view-transition-enter-active,
.view-transition-leave-active {
  transition: all 0.3s ease;
}

.view-transition-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.view-transition-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Enhanced button group styling */
.btn-group {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.btn-group button:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group button:last-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.btn-group button:not(:first-child):not(:last-child) {
  border-radius: 0;
}

/* Graph export button styling */
.export-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s ease;
}

.export-btn:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Risk level indicators */
.risk-low {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.risk-medium {
  color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.1);
}

.risk-high {
  color: #f97316;
  background-color: rgba(249, 115, 22, 0.1);
}

.risk-critical {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

/* Graph minimap styling */
.minimap {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 150px;
  height: 100px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.dark .minimap {
  background: rgba(31, 41, 55, 0.9);
  border-color: #374151;
}

/* Connection strength indicators */
.connection-weak {
  stroke-dasharray: 2,2;
  opacity: 0.4;
}

.connection-medium {
  stroke-dasharray: 4,2;
  opacity: 0.6;
}

.connection-strong {
  opacity: 0.8;
}

/* Node type specific styling */
.node-exchange {
  fill: #3b82f6;
}

.node-wallet {
  fill: #10b981;
}

.node-mixer {
  fill: #ef4444;
}

.node-darknet {
  fill: #dc2626;
}

.node-defi {
  fill: #f59e0b;
}

.node-target {
  fill: #8b5cf6;
  stroke: #6d28d9;
  stroke-width: 3px;
}

/* Timeline specific enhancements */
.timeline-axis {
  stroke: #6b7280;
  stroke-width: 2;
}

.timeline-tick {
  stroke: #9ca3af;
  stroke-width: 1;
}

.timeline-label {
  fill: #6b7280;
  font-size: 12px;
  text-anchor: middle;
}

/* Sankey diagram enhancements */
.sankey-node-label {
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: central;
}

.sankey-value-label {
  font-size: 11px;
  fill: #6b7280;
  text-anchor: middle;
}

/* Heatmap time labels */
.heatmap-day-label {
  font-size: 11px;
  fill: #6b7280;
  text-anchor: middle;
}

.heatmap-hour-label {
  font-size: 10px;
  fill: #9ca3af;
  text-anchor: middle;
}

/* Graph controls styling */
.graph-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dark .control-btn {
  background: rgba(31, 41, 55, 0.9);
  border-color: #4b5563;
}

.dark .control-btn:hover {
  background: rgba(31, 41, 55, 1);
  border-color: #6b7280;
}

/* Performance optimizations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Container queries for responsive design */
@container (max-width: 600px) {
  .graph-container {
    height: 300px;
  }
  
  .control-btn {
    width: 32px;
    height: 32px;
  }
  
  .minimap {
    width: 120px;
    height: 80px;
  }
}

/* Print-specific styles */
@media print {
  .graph-controls,
  .tooltip,
  .minimap {
    display: none !important;
  }
  
  .graph-container {
    background: white !important;
    border: 1px solid #000;
  }
  
  svg {
    background: white !important;
  }
  
  .stat-card {
    break-inside: avoid;
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .critical-risk-node,
  .high-risk-edge,
  .flow-path,
  .selected-node,
  .graph-skeleton {
    animation: none !important;
  }
  
  * {
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode adjustments */
@media (prefers-contrast: high) {
  .node-exchange { fill: #0000ff; }
  .node-wallet { fill: #008000; }
  .node-mixer { fill: #ff0000; }
  .node-darknet { fill: #800000; }
  .node-defi { fill: #ff8000; }
  .node-target { fill: #800080; stroke: #400040; }
  
  .risk-low { color: #008000; background-color: rgba(0, 128, 0, 0.2); }
  .risk-medium { color: #ff8000; background-color: rgba(255, 128, 0, 0.2); }
  .risk-high { color: #ff4000; background-color: rgba(255, 64, 0, 0.2); }
  .risk-critical { color: #ff0000; background-color: rgba(255, 0, 0, 0.2); }
}

/* Force hardware acceleration for smooth animations */
.animate-gpu {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Custom scrollbar for the entire component */
.graph-analysis::-webkit-scrollbar {
  width: 8px;
}

.graph-analysis::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.graph-analysis::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.graph-analysis::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .graph-analysis::-webkit-scrollbar-track {
  background: #374151;
}

.dark .graph-analysis::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark .graph-analysis::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>

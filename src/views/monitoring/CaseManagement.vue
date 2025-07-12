<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="page-header">
                    <div class="header-content">
                        <div class="title-section">
                            <div class="title-wrapper">
                                <i class="pi pi-briefcase header-icon"></i>
                                <div class="title-text">
                                    <h3 class="page-title">Case Management</h3>
                                    <p class="page-subtitle">Monitor and manage compliance cases</p>
                                </div>
                            </div>
                            <div class="stats-summary">
                                <div class="quick-stat">
                                    <span class="stat-number">{{ caseStats.pendingL1 + caseStats.pendingL2 }}</span>
                                    <span class="stat-label">Active Cases</span>
                                </div>
                                <div class="quick-stat urgent">
                                    <span class="stat-number">{{ caseStats.anomalies }}</span>
                                    <span class="stat-label">High Priority</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="action-section">
                            <div class="action-buttons">
                                <Button 
                                    icon="pi pi-bell" 
                                    :label="`Notifications ${unreadNotifications.length > 0 ? '(' + unreadNotifications.length + ')' : ''}`"
                                    @click="showNotificationsDialog = true"
                                    class="notification-btn"
                                    :class="{ 'has-notifications': unreadNotifications.length > 0 }"
                                    outlined
                                    v-if="authStore.hasPermission('read')">
                                    <template #icon>
                                        <div class="notification-icon-wrapper">
                                            <i class="pi pi-bell"></i>
                                            <span 
                                                v-if="unreadNotifications.length > 0" 
                                                class="notification-badge">
                                                {{ unreadNotifications.length > 99 ? '99+' : unreadNotifications.length }}
                                            </span>
                                        </div>
                                    </template>
                                </Button>
                                
                                <Button 
                                    icon="pi pi-plus" 
                                    label="New Case" 
                                    @click="showCreateDialog = true"
                                    class="primary-action-btn"
                                    v-if="authStore.hasPermission('write')" />
                                
                                <Button 
                                    icon="pi pi-refresh" 
                                    label="Refresh" 
                                    @click="fetchAnomalies"
                                    :loading="loading"
                                    class="p-button-outlined"
                                    v-tooltip.top="'Refresh anomaly data'" />
                            </div>
                            
                            <div class="user-info" v-if="authStore.user">
                                <Avatar 
                                    :label="getInitials(authStore.user.name)"
                                    size="normal"
                                    shape="circle"
                                    class="user-avatar"
                                    :style="{ backgroundColor: getAvatarColor(authStore.user.name) }" />
                                <div class="user-details">
                                    <span class="user-name">{{ authStore.user.name }}</span>
                                    <span class="user-role">{{ authStore.user.role }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick Actions Bar -->
                    <div class="quick-actions-bar" v-if="authStore.hasPermission('write')">
                        <div class="quick-actions-content">
                            <span class="quick-actions-label">Quick Actions:</span>
                            <div class="quick-action-items">
                                <Button 
                                    icon="pi pi-upload" 
                                    label="Bulk Import" 
                                    class="p-button-text quick-action-item"
                                    size="small" />
                                <Button 
                                    icon="pi pi-download" 
                                    label="Export Cases" 
                                    class="p-button-text quick-action-item"
                                    size="small"
                                    @click="exportCases" />
                                <Button 
                                    icon="pi pi-filter" 
                                    label="Advanced Filter" 
                                    class="p-button-text quick-action-item"
                                    size="small" />
                                <Button 
                                    icon="pi pi-chart-bar" 
                                    label="Analytics" 
                                    class="p-button-text quick-action-item"
                                    size="small" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- API Status Indicator -->
                <div v-if="apiError" class="api-error-banner p-3 mb-4 border-round" 
                     style="background: var(--red-50); border: 1px solid var(--red-200); color: var(--red-700);">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-exclamation-triangle"></i>
                        <span class="font-medium">API Connection Error:</span>
                        <span>{{ apiError }}</span>
                        <Button 
                            icon="pi pi-refresh" 
                            label="Retry" 
                            class="p-button-sm p-button-text p-button-danger ml-auto"
                            @click="fetchAnomalies" />
                    </div>
                </div>

                <!-- Case Statistics -->
                <div class="grid mb-4">
                    <div class="col-12 md:col-3">
                        <div class="stats-card surface-card p-4 border-round text-center shadow-1 h-full">
                            <div class="text-3xl font-bold text-blue-500 mb-2">{{ caseStats.pendingL1 }}</div>
                            <div class="text-600 font-medium">Pending L1 Review</div>
                        </div>
                    </div>
                    <div class="col-12 md:col-3">
                        <div class="stats-card surface-card p-4 border-round text-center shadow-1 h-full">
                            <div class="text-3xl font-bold text-orange-500 mb-2">{{ caseStats.pendingL2 }}</div>
                            <div class="text-600 font-medium">Pending L2 Review</div>
                        </div>
                    </div>
                    <div class="col-12 md:col-3">
                        <div class="stats-card surface-card p-4 border-round text-center shadow-1 h-full">
                            <div class="text-3xl font-bold text-red-500 mb-2">{{ caseStats.anomalies }}</div>
                            <div class="text-600 font-medium">Anomalies Detected</div>
                        </div>
                    </div>
                    <div class="col-12 md:col-3">
                        <div class="stats-card surface-card p-4 border-round text-center shadow-1 h-full">
                            <div class="text-3xl font-bold text-purple-500 mb-2">{{ caseStats.blacklisted }}</div>
                            <div class="text-600 font-medium">Blacklisted Wallets</div>
                        </div>
                    </div>
                </div>

                <!-- Case Filters -->
                <div class="filter-section surface-ground p-4 border-round mb-4">
                    <div class="flex flex-wrap gap-3 align-items-center">
                        <div class="filter-group">
                            <label class="block text-600 font-medium mb-2">Level</label>
                            <Dropdown v-model="selectedLevel" 
                                      :options="levelOptions" 
                                      optionLabel="label" 
                                      placeholder="All Levels" 
                                      class="w-12rem" 
                                      showClear />
                        </div>
                        <div class="filter-group">
                            <label class="block text-600 font-medium mb-2">Status</label>
                            <Dropdown v-model="selectedStatus" 
                                      :options="statusOptions" 
                                      optionLabel="label" 
                                      placeholder="All Statuses" 
                                      class="w-12rem" 
                                      showClear />
                        </div>
                        <div class="filter-group">
                            <label class="block text-600 font-medium mb-2">Priority</label>
                            <Dropdown v-model="selectedPriority" 
                                      :options="priorityOptions" 
                                      optionLabel="label" 
                                      placeholder="All Priorities" 
                                      class="w-12rem" 
                                      showClear />
                        </div>
                        <div class="filter-group">
                            <label class="block text-600 font-medium mb-2">Crypto</label>
                            <Dropdown v-model="selectedCrypto" 
                                      :options="cryptoOptions" 
                                      optionLabel="label" 
                                      placeholder="All Cryptos" 
                                      class="w-12rem" 
                                      showClear />
                        </div>
                        <div class="filter-group">
                            <label class="block text-600 font-medium mb-2">Date Range</label>
                            <Calendar v-model="dateRange" 
                                      selectionMode="range" 
                                      placeholder="Select Date Range" 
                                      class="w-15rem" 
                                      showIcon 
                                      showButtonBar />
                        </div>
                        <div class="filter-group flex-1">
                            <label class="block text-600 font-medium mb-2">Search</label>
                            <InputText v-model="searchTerm" 
                                       placeholder="Search cases, wallets..." 
                                       class="w-full"
                                       icon="pi pi-search" />
                        </div>
                    </div>
                </div>

                <!-- Cases Table -->
                <div class="table-container">
                    <DataTable :value="filteredCases"
                               :paginator="true"
                               :rows="10"
                               :loading="loading"
                               v-model:selection="selectedCases"
                               selectionMode="multiple"
                               dataKey="id"
                               responsiveLayout="scroll"
                               :sortField="'createdAt'"
                               :sortOrder="-1"
                               class="p-datatable-sm case-table"
                               stripedRows
                               showGridlines>
                        
                        <Column selectionMode="multiple" headerStyle="width: 3rem" :exportable="false"></Column>
                        
                        <Column field="id" header="Case ID" :sortable="true" headerClass="font-bold">
                            <template #body="slotProps">
                                <div class="flex align-items-center">
                                    <span class="font-bold text-primary cursor-pointer" 
                                          @click="viewCase(slotProps.data)">
                                        {{ slotProps.data.id }}
                                    </span>
                                </div>
                            </template>
                        </Column>

                        <Column field="wallet" header="Wallet Address" :sortable="true" headerClass="font-bold">
                            <template #body="slotProps">
                                <div class="wallet-cell">
                                    <div class="font-mono text-sm">
                                        {{ formatWalletAddress(slotProps.data.wallet) }}
                                    </div>
                                    <Button 
                                        icon="pi pi-copy" 
                                        class="p-button-text p-button-sm"
                                        @click="copyToClipboard(slotProps.data.wallet)"
                                        v-tooltip.top="'Copy wallet address'" />
                                </div>
                            </template>
                        </Column>

                        <Column field="crypto" header="Crypto" :sortable="true" headerClass="font-bold">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.crypto"
                                     :severity="getCryptoSeverity(slotProps.data.crypto)"
                                     class="font-medium" />
                            </template>
                        </Column>

                        <Column field="amount" header="Amount" :sortable="true" headerClass="font-bold">
                            <template #body="slotProps">
                                <div class="amount-cell">
                                    <div class="font-bold text-900">{{ slotProps.data.amount }}</div>
                                </div>
                            </template>
                        </Column>

                        <Column field="level" header="Level" :sortable="true" headerClass="font-bold">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.level"
                                     :severity="getLevelSeverity(slotProps.data.level)"
                                     class="font-medium" />
                            </template>
                        </Column>

                        <Column field="status" header="Status" :sortable="true" headerClass="font-bold">
                            <template #body="slotProps">
                                <Tag :value="getStatusLabel(slotProps.data.status)"
                                     :severity="getStatusSeverity(slotProps.data.status)"
                                     class="font-medium" />
                            </template>
                        </Column>

                        <Column field="priority" header="Priority" :sortable="true" headerClass="font-bold">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.priority"
                                     :severity="getPrioritySeverity(slotProps.data.priority)"
                                     class="font-medium" />
                            </template>
                        </Column>

                        <Column field="assignedTo" header="Assigned To" headerClass="font-bold">
                            <template #body="slotProps">
                                <div class="flex align-items-center">
                                    <Avatar :label="getInitials(slotProps.data.assignedTo)"
                                            size="small"
                                            shape="circle"
                                            class="mr-2"
                                            :style="{ backgroundColor: getAvatarColor(slotProps.data.assignedTo) }" />
                                    <span class="text-900">{{ slotProps.data.assignedTo || 'Unassigned' }}</span>
                                </div>
                            </template>
                        </Column>

                        <Column field="createdAt" header="Created" :sortable="true" headerClass="font-bold">
                            <template #body="slotProps">
                                <div class="date-cell">
                                    <div class="font-medium text-900">{{ formatDate(slotProps.data.createdAt) }}</div>
                                    <small class="text-600">{{ formatTime(slotProps.data.createdAt) }}</small>
                                </div>
                            </template>
                        </Column>

                        <Column header="Actions" :exportable="false" headerClass="font-bold">
                            <template #body="slotProps">
                                <div class="flex gap-1">
                                    <Button icon="pi pi-eye"
                                            class="p-button-rounded p-button-text p-button-sm action-btn"
                                            @click="viewCase(slotProps.data)"
                                            v-tooltip.top="'View Details'" />
                                    <Button icon="pi pi-send"
                                            class="p-button-rounded p-button-text p-button-sm p-button-warning action-btn"
                                            @click="escalateCase(slotProps.data)"
                                            v-tooltip.top="'Escalate to L2'"
                                            :disabled="!canEscalate(slotProps.data)"
                                            v-if="authStore.isL1Analyst || authStore.isAdmin" />
                                    <Button icon="pi pi-check"
                                            class="p-button-rounded p-button-text p-button-sm p-button-success action-btn"
                                            @click="approveCase(slotProps.data)"
                                            v-tooltip.top="'Approve'"
                                            :disabled="!canApprove(slotProps.data)"
                                            v-if="authStore.hasPermission('approve')" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>

        <!-- Case Details Dialog -->
        <Dialog v-model:visible="showCaseDialog"
                :header="selectedCase ? 'Case Details: ' + selectedCase.id : ''"
                :modal="true"
                :style="{ width: '90vw', maxWidth: '1200px' }"
                :maximizable="true"
                :closable="true"
                class="case-details-dialog">
            <div v-if="selectedCase" class="grid">
                <div class="col-12 lg:col-8">
                    <div class="surface-card p-4 border-round shadow-1">
                        <div class="flex flex-column lg:flex-row justify-content-between align-items-start lg:align-items-center mb-4 gap-3">
                            <div class="flex-1">
                                <h5 class="m-0 text-2xl font-bold text-900">{{ selectedCase.title }}</h5>
                                <p class="text-600 mt-2 mb-0 line-height-3">{{ selectedCase.description }}</p>
                                <div class="mt-3 p-3 surface-ground border-round">
                                    <div class="grid">
                                        <div class="col-12 md:col-6">
                                            <label class="block text-600 font-medium mb-1">Wallet Address</label>
                                            <div class="font-mono text-sm">{{ selectedCase.wallet }}</div>
                                        </div>
                                        <div class="col-12 md:col-6">
                                            <label class="block text-600 font-medium mb-1">Amount</label>
                                            <div class="font-bold text-900">{{ selectedCase.amount }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex gap-2 flex-wrap">
                                <Tag :value="selectedCase.crypto"
                                     :severity="getCryptoSeverity(selectedCase.crypto)"
                                     class="font-medium" />
                                <Tag :value="selectedCase.level"
                                     :severity="getLevelSeverity(selectedCase.level)"
                                     class="font-medium" />
                                <Tag :value="getStatusLabel(selectedCase.status)"
                                     :severity="getStatusSeverity(selectedCase.status)"
                                     class="font-medium" />
                                <Tag :value="selectedCase.priority"
                                     :severity="getPrioritySeverity(selectedCase.priority)"
                                     class="font-medium" />
                            </div>
                        </div>

                        <TabView class="case-tabs">
                            <TabPanel header="Documents" leftIcon="pi pi-file">
                                <div class="documents-section">
                                    <DataTable :value="selectedCase.documents"
                                               class="p-datatable-sm"
                                               stripedRows
                                               showGridlines>
                                        <Column field="name" header="Document" headerClass="font-bold"></Column>
                                        <Column field="type" header="Type" headerClass="font-bold"></Column>
                                        <Column field="status" header="Status" headerClass="font-bold">
                                            <template #body="slotProps">
                                                <Tag :value="slotProps.data.status"
                                                     :severity="getDocumentStatusSeverity(slotProps.data.status)"
                                                     class="font-medium" />
                                            </template>
                                        </Column>
                                        <Column field="uploadedBy" header="Uploaded By" headerClass="font-bold"></Column>
                                        <Column field="uploadedAt" header="Uploaded At" headerClass="font-bold">
                                            <template #body="slotProps">
                                                <span class="font-medium">{{ formatDate(slotProps.data.uploadedAt) }}</span>
                                            </template>
                                        </Column>
                                        <Column header="Actions" headerClass="font-bold">
                                            <template #body="slotProps">
                                                <Button icon="pi pi-download"
                                                        class="p-button-text p-button-sm"
                                                        v-tooltip.top="'Download'" />
                                            </template>
                                        </Column>
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel header="Activity" leftIcon="pi pi-clock">
                                <div class="activity-section">
                                    <Timeline :value="selectedCase.activities"
                                             class="w-full custom-timeline">
                                        <template #content="slotProps">
                                            <div class="timeline-content surface-ground p-3 border-round shadow-1">
                                                <div class="flex justify-content-between align-items-center mb-2">
                                                    <span class="font-bold text-900">{{ slotProps.item.action }}</span>
                                                    <small class="text-600">{{ formatDateTime(slotProps.item.timestamp) }}</small>
                                                </div>
                                                <div class="text-700 mb-2">{{ slotProps.item.user }}</div>
                                                <div v-if="slotProps.item.comment" 
                                                     class="surface-card p-3 border-round border-left-3 border-primary">
                                                    <i class="pi pi-comment mr-2 text-600"></i>
                                                    {{ slotProps.item.comment }}
                                                </div>
                                            </div>
                                        </template>
                                    </Timeline>
                                </div>
                            </TabPanel>

                            <TabPanel header="Notes" leftIcon="pi pi-comment">
                                <div class="notes-section">
                                    <div class="flex flex-column gap-3 mb-4">
                                        <div v-for="note in selectedCase.notes"
                                             :key="note.id"
                                             class="note-item surface-ground p-4 border-round shadow-1">
                                            <div class="flex justify-content-between align-items-center mb-3">
                                                <div class="flex align-items-center gap-2">
                                                    <Avatar :label="getInitials(note.user)"
                                                            size="small"
                                                            shape="circle"
                                                            :style="{ backgroundColor: getAvatarColor(note.user) }" />
                                                    <span class="font-bold text-900">{{ note.user }}</span>
                                                </div>
                                                <small class="text-600 font-medium">{{ formatDateTime(note.timestamp) }}</small>
                                            </div>
                                            <p class="m-0 line-height-3 text-700">{{ note.content }}</p>
                                        </div>
                                    </div>
                                    <div class="add-note-section surface-card p-4 border-round shadow-1">
                                        <h6 class="text-900 mb-3">Add New Note</h6>
                                        <div class="flex gap-2">
                                            <InputText v-model="newNote"
                                                      placeholder="Add a note..."
                                                      class="flex-1" />
                                            <Button label="Add Note"
                                                    icon="pi pi-plus"
                                                    @click="addNote"
                                                    :disabled="!newNote.trim()" />
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>

                <div class="col-12 lg:col-4">
                    <div class="sidebar-content">
                        <div class="surface-card p-4 border-round shadow-1 mb-4">
                            <h6 class="text-900 font-bold mb-3 border-bottom-1 surface-border pb-2">Case Information</h6>
                            <div class="grid">
                                <div class="col-12">
                                    <div class="info-item mb-3">
                                        <label class="block text-600 font-medium mb-1">Created By</label>
                                        <div class="font-bold text-900">{{ selectedCase.createdBy }}</div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="info-item mb-3">
                                        <label class="block text-600 font-medium mb-1">Created At</label>
                                        <div class="font-bold text-900">{{ formatDateTime(selectedCase.createdAt) }}</div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="info-item mb-3">
                                        <label class="block text-600 font-medium mb-1">Last Updated</label>
                                        <div class="font-bold text-900">{{ formatDateTime(selectedCase.updatedAt) }}</div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="info-item">
                                        <label class="block text-600 font-medium mb-1">Due Date</label>
                                        <div class="font-bold text-900">{{ formatDate(selectedCase.dueDate) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="surface-card p-4 border-round shadow-1">
                            <h6 class="text-900 font-bold mb-3 border-bottom-1 surface-border pb-2">Stakeholders</h6>
                            <div class="flex flex-column gap-3">
                                <div v-for="stakeholder in selectedCase.stakeholders"
                                     :key="stakeholder.id"
                                     class="stakeholder-item flex align-items-center justify-content-between p-3 surface-ground border-round">
                                    <div class="flex align-items-center gap-3">
                                        <Avatar :label="getInitials(stakeholder.name)"
                                                size="normal"
                                                shape="circle"
                                                :style="{ backgroundColor: getAvatarColor(stakeholder.name) }" />
                                        <div>
                                            <div class="font-bold text-900">{{ stakeholder.name }}</div>
                                            <small class="text-600 font-medium">{{ stakeholder.role }}</small>
                                        </div>
                                    </div>
                                    <Tag :value="stakeholder.notificationStatus"
                                         :severity="getNotificationStatusSeverity(stakeholder.notificationStatus)"
                                         class="font-medium" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { amlCaseService } from '@/services/AMLCaseService';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import Tag from 'primevue/tag';
import Timeline from 'primevue/timeline';
import { computed, onMounted, ref } from 'vue';

// Auth store
const authStore = useAuthStore();

// Reactive State
const loading = ref(false);
const apiError = ref(null);
const cases = ref([]);
const selectedCases = ref([]);
const selectedCase = ref(null);
const showCaseDialog = ref(false);
const showCreateDialog = ref(false);
const showNotificationsDialog = ref(false);
const searchTerm = ref('');
const selectedLevel = ref(null);
const selectedStatus = ref(null);
const selectedPriority = ref(null);
const selectedCrypto = ref(null);
const dateRange = ref(null);
const newNote = ref('');
const unreadNotifications = ref([]);

// Case Statistics
const caseStats = computed(() => ({
    pendingL1: cases.value.filter(c => c.level === 'L1' && c.status !== 'approved').length,
    pendingL2: cases.value.filter(c => c.level === 'L2' && c.status !== 'approved').length,
    anomalies: cases.value.filter(c => c.priority === 'high').length,
    blacklisted: cases.value.filter(c => c.status === 'rejected').length
}));

// Options
const levelOptions = [
    { label: 'L1', value: 'L1' },
    { label: 'L2', value: 'L2' }
];

const statusOptions = [
    { label: 'New', value: 'new' },
    { label: 'In Review', value: 'in_review' },
    { label: 'Pending Documents', value: 'pending_docs' },
    { label: 'Escalated', value: 'escalated' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' }
];

const priorityOptions = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' }
];

const cryptoOptions = computed(() => {
    const cryptos = [...new Set(cases.value.map(c => c.crypto))];
    return cryptos.map(crypto => ({ label: crypto, value: crypto }));
});

// Computed
const filteredCases = computed(() => {
    // First filter by user role
    let filtered = [...cases.value].filter(case_ => {
        if (authStore.isAdmin) {
            return true; // Admin sees all cases
        } else if (authStore.isL2Analyst) {
            return case_.level === 'L2'; // L2 analyst only sees L2 cases
        } else if (authStore.isL1Analyst) {
            return case_.level === 'L1'; // L1 analyst only sees L1 cases
        }
        return false;
    });

    // Then apply other filters
    if (selectedLevel.value) {
        filtered = filtered.filter(case_ => case_.level === selectedLevel.value.value);
    }

    if (selectedStatus.value) {
        filtered = filtered.filter(case_ => case_.status === selectedStatus.value.value);
    }

    if (selectedPriority.value) {
        filtered = filtered.filter(case_ => case_.priority === selectedPriority.value.value);
    }

    if (selectedCrypto.value) {
        filtered = filtered.filter(case_ => case_.crypto === selectedCrypto.value.value);
    }

    if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        filtered = filtered.filter(case_ => 
            case_.id.toLowerCase().includes(term) ||
            case_.title?.toLowerCase().includes(term) ||
            case_.description?.toLowerCase().includes(term) ||
            case_.wallet?.toLowerCase().includes(term)
        );
    }

    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
        const startDate = dateRange.value[0];
        const endDate = dateRange.value[1];
        filtered = filtered.filter(case_ => {
            const caseDate = new Date(case_.createdAt);
            return caseDate >= startDate && caseDate <= endDate;
        });
    }

    return filtered;
});

// Methods
const fetchAnomalies = async () => {
    loading.value = true;
    apiError.value = null;
    
    try {
        console.log('Fetching anomalies from API...');
        const anomalies = await amlCaseService.getAnomalies();
        cases.value = anomalies;
        console.log(`Loaded ${anomalies.length} cases from API`);
    } catch (error) {
        console.error('Error fetching anomalies:', error);
        apiError.value = error.message;
    } finally {
        loading.value = false;
    }
};

const viewCase = (case_) => {
    selectedCase.value = case_;
    showCaseDialog.value = true;
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
                    user: authStore.user?.name || 'Current User',
                    comment: 'Escalated for further review'
                }
            ]
        };

        await amlCaseService.updateCase(case_.id, updatedCase);
        
        // Update local case
        const index = cases.value.findIndex(c => c.id === case_.id);
        if (index !== -1) {
            cases.value[index] = updatedCase;
        }
        
        // Send notifications
        await sendNotifications(case_, 'escalation');
    } catch (error) {
        console.error('Error escalating case:', error);
        apiError.value = 'Failed to escalate case';
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
                    user: authStore.user?.name || 'Current User',
                    comment: 'All requirements met'
                }
            ]
        };

        await amlCaseService.updateCase(case_.id, updatedCase);
        
        // Update local case
        const index = cases.value.findIndex(c => c.id === case_.id);
        if (index !== -1) {
            cases.value[index] = updatedCase;
        }
        
        // Send notifications
        await sendNotifications(case_, 'approval');
    } catch (error) {
        console.error('Error approving case:', error);
        apiError.value = 'Failed to approve case';
    }
};

const addNote = () => {
    if (selectedCase.value && newNote.value.trim()) {
        selectedCase.value.notes.push({
            id: Date.now(),
            content: newNote.value,
            user: authStore.user?.name || 'Current User',
            timestamp: new Date()
        });
        newNote.value = '';
    }
};

const sendNotifications = async (case_, type) => {
    // Simulate sending notifications
    console.log(`Sending ${type} notifications for case ${case_.id}`);
    
    // Update stakeholder notification status
    case_.stakeholders.forEach(stakeholder => {
        stakeholder.notificationStatus = 'sent';
    });
};

const exportCases = () => {
    try {
        const csvData = amlCaseService.exportCases(filteredCases.value);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `aml-cases-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting cases:', error);
        apiError.value = 'Failed to export cases';
    }
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        // You could add a toast notification here
        console.log('Copied to clipboard:', text);
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
    }
};

// Utility functions
const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

const formatTime = (date) => {
    return new Date(date).toLocaleTimeString();
};

const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
};

const formatWalletAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getInitials = (name) => {
    return name
        ? name
              .split(' ')
              .map(n => n[0])
              .join('')
        : '?';
};

const getAvatarColor = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
};

const getLevelSeverity = (level) => {
    switch (level) {
        case 'L1': return 'info';
        case 'L2': return 'warning';
        default: return 'info';
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'new': return 'info';
        case 'in_review': return 'warning';
        case 'pending_docs': return 'warning';
        case 'escalated': return 'danger';
        case 'approved': return 'success';
        case 'rejected': return 'danger';
        default: return 'info';
    }
};

const getStatusLabel = (status) => {
    const statusLabels = {
        'new': 'New',
        'in_review': 'In Review',
        'pending_docs': 'Pending Documents',
        'escalated': 'Escalated',
        'approved': 'Approved',
        'rejected': 'Rejected'
    };
    return statusLabels[status] || status;
};

const getPrioritySeverity = (priority) => {
    switch (priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'info';
    }
};

const getCryptoSeverity = (crypto) => {
    switch (crypto) {
        case 'BTC': return 'warning';
        case 'ETH': return 'info';
        case 'USDT': return 'success';
        case 'USDC': return 'success';
        default: return 'secondary';
    }
};

const getDocumentStatusSeverity = (status) => {
    switch (status) {
        case 'pending_review': return 'warning';
        case 'approved': return 'success';
        case 'rejected': return 'danger';
        default: return 'info';
    }
};

const getNotificationStatusSeverity = (status) => {
    switch (status) {
        case 'sent': return 'success';
        case 'pending': return 'warning';
        case 'failed': return 'danger';
        default: return 'info';
    }
};

const canEscalate = (case_) => {
    const hasPermission = authStore.isL1Analyst || authStore.isAdmin;
    return hasPermission && case_.level === 'L1' && case_.status !== 'approved' && case_.status !== 'rejected';
};

const canApprove = (case_) => {
    const hasPermission = authStore.hasPermission('approve');
    return hasPermission && case_.status !== 'approved' && case_.status !== 'rejected';
};

// Lifecycle
onMounted(() => {
    fetchAnomalies();
    
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
        if (!loading.value) {
            fetchAnomalies();
        }
    }, 30000);
    
    // Cleanup on unmount
    return () => {
        clearInterval(refreshInterval);
    };
});
</script>

<style scoped>
/* Page Header Styling */
.page-header {
    background: linear-gradient(135deg, var(--surface-card) 0%, var(--surface-ground) 100%);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    margin-bottom: 2rem;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 2rem;
    gap: 2rem;
}

/* Title Section */
.title-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-icon {
    font-size: 2.5rem;
    color: var(--primary-color);
    background: var(--primary-50);
    padding: 1rem;
    border-radius: 12px;
    border: 2px solid var(--primary-100);
}

.title-text {
    flex: 1;
}

.page-title {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-color);
    line-height: 1.2;
}

.page-subtitle {
    margin: 0.5rem 0 0 0;
    color: var(--text-color-secondary);
    font-size: 1rem;
    font-weight: 500;
}

/* Stats Summary */
.stats-summary {
    display: flex;
    gap: 2rem;
}

.quick-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 1.5rem;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    min-width: 100px;
    transition: all 0.3s ease;
}

.quick-stat:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-stat.urgent {
    border-color: var(--red-200);
    background: var(--red-50);
}

.stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1;
}

.quick-stat.urgent .stat-number {
    color: var(--red-500);
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 0.25rem;
}

/* Action Section */
.action-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.action-buttons {
    display: flex;
    gap: 0.75rem;
}

/* Notification Button */
.notification-btn {
    position: relative;
    transition: all 0.3s ease;
}

.notification-btn.has-notifications {
    animation: pulse 2s infinite;
}

.notification-icon-wrapper {
    position: relative;
    display: inline-block;
}

.notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--red-500);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.4rem;
    border-radius: 10px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--surface-card);
}

/* Primary Action Button */
.primary-action-btn {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
    border: none;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    transition: all 0.3s ease;
}

.primary-action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.3);
}

/* User Info */
.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.user-info:hover {
    background: var(--surface-hover);
}

.user-avatar {
    border: 2px solid var(--surface-border);
}

.user-details {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.9rem;
}

.user-role {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Quick Actions Bar */
.quick-actions-bar {
    background: var(--surface-ground);
    border-top: 1px solid var(--surface-border);
    padding: 1rem 2rem;
}

.quick-actions-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.quick-actions-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    white-space: nowrap;
}

.quick-action-items {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.quick-action-item {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.quick-action-item:hover {
    background: var(--surface-hover);
    color: var(--primary-color);
}

/* Table Styling */
.wallet-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.amount-cell {
    text-align: right;
}

.date-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.action-btn {
    transition: all 0.2s ease;
}

.action-btn:hover {
    transform: scale(1.1);
}

/* Filter Section */
.filter-section {
    border: 1px solid var(--surface-border);
}

.filter-group {
    min-width: 150px;
}

/* Case Details Dialog */
.case-details-dialog :deep(.p-dialog-content) {
    padding: 0;
}

.case-tabs :deep(.p-tabview-panels) {
    padding: 1rem 0;
}

.timeline-content {
    margin-left: 1rem;
}

.note-item {
    border-left: 3px solid var(--primary-color);
}

.stakeholder-item {
    transition: all 0.2s ease;
}

.stakeholder-item:hover {
    background: var(--surface-hover);
}

/* Animations */
@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(var(--red-500-rgb), 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(var(--red-500-rgb), 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(var(--red-500-rgb), 0);
    }
}

/* Responsive Design */
@media (max-width: 1024px) {
    .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1.5rem;
    }
    
    .title-section {
        align-items: center;
        text-align: center;
    }
    
    .stats-summary {
        justify-content: center;
    }
    
    .action-section {
        justify-content: center;
        flex-wrap: wrap;
    }
}

@media (max-width: 768px) {
    .header-content {
        padding: 1.5rem;
    }
    
    .title-wrapper {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
    }
    
    .header-icon {
        font-size: 2rem;
        padding: 0.75rem;
    }
    
    .page-title {
        font-size: 1.5rem;
    }
    
    .stats-summary {
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }
    
    .quick-stat {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        text-align: left;
    }
    
    .action-buttons {
        flex-direction: column;
        width: 100%;
    }
    
    .action-buttons .p-button {
        width: 100%;
        justify-content: center;
    }
    
    .quick-actions-bar {
        padding: 1rem 1.5rem;
    }
    
    .quick-actions-content {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
    }
    
    .quick-action-items {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .user-info {
        flex-direction: column;
        text-align: center;
        padding: 1rem;
    }
    
    .notification-btn :deep(.p-button-label) {
        display: none;
    }
    
    .quick-action-item :deep(.p-button-label) {
        display: none;
    }
    
    .filter-section {
        padding: 1rem;
    }
    
    .filter-group {
        min-width: 100%;
    }
    
    .wallet-cell {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }
}

/* Dark Mode Adjustments */
@media (prefers-color-scheme: dark) {
    .page-header {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .quick-stat:hover {
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
    }
    
    .primary-action-btn:hover {
        box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
    }
}

/* Loading States */
.p-datatable.p-datatable-loading .p-datatable-tbody > tr > td {
    background: var(--surface-ground);
}

/* API Error Banner */
.api-error-banner {
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Stats Cards */
.stats-card {
    transition: all 0.3s ease;
    cursor: pointer;
}

.stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Table Container */
.table-container {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--surface-border);
}

.case-table :deep(.p-datatable-header) {
    background: var(--surface-section);
    border-bottom: 2px solid var(--surface-border);
}

.case-table :deep(.p-datatable-thead > tr > th) {
    background: var(--surface-section);
    color: var(--text-color);
    font-weight: 600;
    padding: 1rem;
    border-bottom: 1px solid var(--surface-border);
}

.case-table :deep(.p-datatable-tbody > tr) {
    transition: all 0.2s ease;
}

.case-table :deep(.p-datatable-tbody > tr:hover) {
    background: var(--surface-hover);
}

.case-table :deep(.p-datatable-tbody > tr > td) {
    padding: 1rem;
    border-bottom: 1px solid var(--surface-border);
}

/* Case Title Cell */
.case-title-cell {
    max-width: 300px;
}

.case-title-cell .font-medium {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.case-title-cell .text-600 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Sidebar Content */
.sidebar-content {
    position: sticky;
    top: 2rem;
}

.info-item {
    transition: all 0.2s ease;
}

.info-item:hover {
    background: var(--surface-hover);
    padding: 0.5rem;
    border-radius: 4px;
    margin: -0.5rem;
}

/* Custom Timeline */
.custom-timeline :deep(.p-timeline-event-content) {
    margin-left: 1rem;
}

.custom-timeline :deep(.p-timeline-event-marker) {
    background: var(--primary-color);
    border: 2px solid var(--surface-card);
}

.custom-timeline :deep(.p-timeline-event-connector) {
    background: var(--surface-border);
}

/* Utility Classes */
.font-mono {
    font-family: 'Courier New', Courier, monospace;
}

.cursor-pointer {
    cursor: pointer;
}

.cursor-pointer:hover {
    text-decoration: underline;
}

/* Print Styles */
@media print {
    .page-header,
    .quick-actions-bar,
    .action-buttons,
    .p-paginator {
        display: none !important;
    }
    
    .case-table {
        font-size: 0.8rem;
    }
    
    .case-table :deep(.p-datatable-tbody > tr > td) {
        padding: 0.5rem;
    }
}
</style>

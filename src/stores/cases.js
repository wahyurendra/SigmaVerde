import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useCaseStore = defineStore('cases', () => {
    const cases = ref([
        {
            id: 'CASE-001',
            customer: 'Wallet 0x1234...5678',
            crypto: 'BTC',
            amount: '2.5 BTC',
            riskLevel: 'High',
            status: 'Under Review',
            level: 'L1',
            date: '2024-01-15',
            details: {
                description: 'Suspicious transaction pattern detected',
                assignedTo: 'John Doe',
                priority: 'High',
                tags: ['suspicious', 'large-volume','High Value Transaction Alert']
            },
            activities: [
                {
                    timestamp: '2024-01-15',
                    action: 'Case Created',
                    user: 'System',
                    comment: 'Auto-assigned to L1 for initial review'
                }
            ]
        },
        {
            id: 'CASE-002',
            customer: 'Binance Exchange',
            crypto: 'ETH',
            amount: '45.3 ETH',
            riskLevel: 'Medium',
            status: 'Investigating',
            level: 'L2',
            date: '2024-01-14',
            details: {
                description: 'Unusual cross-border activity',
                assignedTo: 'Jane Smith',
                priority: 'Medium',
                tags: ['exchange', 'cross-border']
            },
            activities: [
                {
                    timestamp: '2024-01-14',
                    action: 'Case Created',
                    user: 'System',
                    comment: 'Auto-assigned to L1 for initial review'
                },
                {
                    timestamp: '2024-01-14',
                    action: 'Case Escalated',
                    user: 'John Doe',
                    comment: 'Escalated to L2 for complex analysis'
                }
            ]
        },
        {
            id: 'CASE-003',
            customer: 'Wallet 0x9876...4321',
            crypto: 'BTC',
            amount: '0.8 BTC',
            riskLevel: 'Low',
            status: 'Resolved',
            level: 'L1',
            date: '2024-01-13',
            details: {
                description: 'Regular transaction verified',
                assignedTo: 'Mike Johnson',
                priority: 'Low',
                tags: ['verified', 'regular']
            },
            activities: [
                {
                    timestamp: '2024-01-13',
                    action: 'Case Created',
                    user: 'System',
                    comment: 'Auto-assigned to L1 for initial review'
                },
                {
                    timestamp: '2024-01-13',
                    action: 'Case Resolved',
                    user: 'Mike Johnson',
                    comment: 'Transaction verified as regular activity'
                }
            ]
        },
        {
            id: 'CASE-004',
            customer: 'Kraken Exchange',
            crypto: 'ETH',
            amount: '150.0 ETH',
            riskLevel: 'High',
            status: 'Pending',
            level: 'L2',
            date: '2024-01-12',
            details: {
                description: 'Large volume transaction requires review',
                assignedTo: 'Sarah Wilson',
                priority: 'High',
                tags: ['large-volume', 'exchange']
            },
            activities: [
                {
                    timestamp: '2024-01-12',
                    action: 'Case Created',
                    user: 'System',
                    comment: 'Auto-assigned to L1 for initial review'
                },
                {
                    timestamp: '2024-01-12',
                    action: 'Case Escalated',
                    user: 'Mike Johnson',
                    comment: 'Escalated to L2 due to high transaction volume'
                }
            ]
        },
        {
            id: 'CASE-005',
            customer: 'Wallet 0x5555...7777',
            crypto: 'BTC',
            amount: '1.2 BTC',
            riskLevel: 'Medium',
            status: 'Under Review',
            level: 'L1',
            date: '2024-01-11',
            details: {
                description: 'Multiple small transactions pattern',
                assignedTo: 'Tom Brown',
                priority: 'Medium',
                tags: ['pattern', 'multiple-tx']
            },
            activities: [
                {
                    timestamp: '2024-01-11',
                    action: 'Case Created',
                    user: 'System',
                    comment: 'Auto-assigned to L1 for initial review'
                }
            ]
        }
    ]);

    // Getters
    const recentCases = computed(() => {
        return [...cases.value]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    });

    const getCaseById = (id) => {
        return cases.value.find(case_ => case_.id === id);
    };

    const getCasesByStatus = (status) => {
        return cases.value.filter(case_ => case_.status === status);
    };

    const getCasesByRiskLevel = (riskLevel) => {
        return cases.value.filter(case_ => case_.riskLevel === riskLevel);
    };

    // Actions
    const addCase = (newCase) => {
        // Auto-assign new cases to L1 by default
        const caseWithL1 = {
            ...newCase,
            level: 'L1',
            status: 'new',
            activities: [
                ...(newCase.activities || []),
                {
                    timestamp: new Date(),
                    action: 'Case Created',
                    user: 'System',
                    comment: 'Auto-assigned to L1 for initial review'
                }
            ]
        };
        cases.value.push(caseWithL1);
    };

    const updateCase = (id, updates) => {
        const index = cases.value.findIndex(case_ => case_.id === id);
        if (index !== -1) {
            cases.value[index] = { ...cases.value[index], ...updates };
        }
    };

    const deleteCase = (id) => {
        const index = cases.value.findIndex(case_ => case_.id === id);
        if (index !== -1) {
            cases.value.splice(index, 1);
        }
    };

    return {
        cases,
        recentCases,
        getCaseById,
        getCasesByStatus,
        getCasesByRiskLevel,
        addCase,
        updateCase,
        deleteCase
    };
});

// ===== Mock Data Storage =====

const MOCK_DATA = {
    // User credentials database
    users: {
        'demo': {
            username: 'demo',
            password: 'demo123',
            name: 'Juan Pérez',
            dni: '12.345.678',
            email: 'juan.perez@email.com',
            phone: '+54 11 1234-5678',
            address: 'Av. Corrientes 1234, CABA, Argentina',
            locked: false
        },
        'wrong': {
            username: 'wrong',
            password: 'correct123',
            name: 'Usuario Test',
            locked: false
        },
        'locked': {
            username: 'locked',
            password: 'locked',
            name: 'Usuario Bloqueado',
            locked: true
        }
    },

    // Account information
    accounts: {
        'demo': [
            {
                id: 'ACC001',
                type: 'Cuenta Corriente',
                number: '1234567890123456',
                displayNumber: '**** **** **** 1234',
                balance: 125450.75,
                currency: 'ARS',
                cbu: '0170001234567890123456'
            },
            {
                id: 'ACC002',
                type: 'Caja de Ahorro',
                number: '5678901234567890',
                displayNumber: '**** **** **** 5678',
                balance: 89320.50,
                currency: 'ARS',
                cbu: '0170005678901234567890'
            },
            {
                id: 'ACC003',
                type: 'Tarjeta de Crédito',
                number: '9012345678901234',
                displayNumber: '**** **** **** 9012',
                balance: 45000.00,
                limit: 150000.00,
                currency: 'ARS'
            }
        ]
    },

    // Transaction history
    transactions: {
        'demo': [
            {
                id: 'TXN001',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
                description: 'Transferencia recibida',
                amount: 15000.00,
                type: 'credit',
                account: 'ACC001'
            },
            {
                id: 'TXN002',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
                description: 'Pago de servicios',
                amount: -3250.50,
                type: 'debit',
                account: 'ACC001'
            },
            {
                id: 'TXN003',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
                description: 'Compra en supermercado',
                amount: -8450.25,
                type: 'debit',
                account: 'ACC003'
            },
            {
                id: 'TXN004',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
                description: 'Depósito en efectivo',
                amount: 25000.00,
                type: 'credit',
                account: 'ACC002'
            },
            {
                id: 'TXN005',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
                description: 'Transferencia enviada',
                amount: -12000.00,
                type: 'debit',
                account: 'ACC001'
            },
            {
                id: 'TXN006',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
                description: 'Pago de tarjeta',
                amount: -5000.00,
                type: 'debit',
                account: 'ACC002'
            },
            {
                id: 'TXN007',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
                description: 'Compra online',
                amount: -2850.00,
                type: 'debit',
                account: 'ACC003'
            },
            {
                id: 'TXN008',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
                description: 'Transferencia recibida',
                amount: 8500.00,
                type: 'credit',
                account: 'ACC001'
            },
            {
                id: 'TXN009',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
                description: 'Retiro cajero automático',
                amount: -5000.00,
                type: 'debit',
                account: 'ACC001'
            },
            {
                id: 'TXN010',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
                description: 'Sueldo',
                amount: 95000.00,
                type: 'credit',
                account: 'ACC001'
            }
        ]
    },

    // Fixed deposits
    fixedDeposits: {
        'demo': [
            {
                id: 'FD001',
                amount: 50000.00,
                term: 90,
                rate: 42,
                startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
                maturityDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
                estimatedInterest: 5178.08,
                status: 'active'
            },
            {
                id: 'FD002',
                amount: 30000.00,
                term: 60,
                rate: 38,
                startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
                maturityDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
                estimatedInterest: 1876.71,
                status: 'active'
            }
        ]
    },

    // Loans
    loans: {
        'demo': [
            {
                id: 'LN001',
                amount: 150000.00,
                installments: 12,
                installmentAmount: 17500.00,
                startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
                status: 'active'
            }
        ]
    },

    // Credit/Debit cards
    cards: {
        'demo': [
            {
                id: 'CARD001',
                type: 'Débito',
                number: '1234567890123456',
                displayNumber: '**** **** **** 1234',
                brand: 'Visa',
                expiryDate: '12/26',
                linkedAccount: 'ACC001'
            },
            {
                id: 'CARD002',
                type: 'Débito',
                number: '5678901234567890',
                displayNumber: '**** **** **** 5678',
                brand: 'Mastercard',
                expiryDate: '08/27',
                linkedAccount: 'ACC002'
            },
            {
                id: 'CARD003',
                type: 'Crédito',
                number: '9012345678901234',
                displayNumber: '**** **** **** 9012',
                brand: 'Visa',
                expiryDate: '03/28',
                limit: 150000.00,
                available: 45000.00
            }
        ]
    },

    // Beneficiaries for transfers
    beneficiaries: {
        'demo': [
            {
                id: 'BEN001',
                name: 'María González',
                cbu: '0170009876543210987654',
                alias: 'MARIA.GONZALEZ.MP'
            },
            {
                id: 'BEN002',
                name: 'Carlos Rodríguez',
                cbu: '0340001122334455667788',
                alias: 'CARLOS.ROD.BANCO'
            }
        ]
    },

    // Interest rates for fixed deposits
    interestRates: {
        30: 35,
        60: 38,
        90: 42,
        180: 45,
        360: 50
    },

    // Transfer limits
    transferLimits: {
        dailyLimit: 100000.00,
        perTransferLimit: 50000.00,
        minimumAmount: 1.00
    },

    // Fixed deposit limits
    depositLimits: {
        minimumAmount: 1000.00,
        maximumActive: 5
    },

    // Payment Services
    services: [
        { id: 'SRV001', name: 'Electricidad', icon: '⚡', suggestedAmount: 8500.00, company: 'Edenor', cuit: '30-11223344-5' },
        { id: 'SRV002', name: 'Gas Natural', icon: '🔥', suggestedAmount: 4200.00, company: 'MetroGAS', cuit: '30-55667788-9' },
        { id: 'SRV003', name: 'Agua', icon: '💧', suggestedAmount: 2800.00, company: 'AySA', cuit: '33-99887766-4' },
        { id: 'SRV004', name: 'Internet', icon: '🌐', suggestedAmount: 12000.00, company: 'Fibertel', cuit: '30-44332211-8' },
        { id: 'SRV005', name: 'Telefonía', icon: '📱', suggestedAmount: 6500.00, company: 'Personal', cuit: '30-66554433-2' }
    ],

    // Virtual Debit Cards
    virtualCards: {
        'demo': []
    },

    virtualCards: {
        'demo': []
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MOCK_DATA;
}

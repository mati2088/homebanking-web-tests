// ===== Mock Services with Controlled Errors =====

const MockServices = {
    // Simulate network delay
    async delay(ms = 800) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Authentication Service
    AuthService: {
        loginAttempts: {},

        async login(username, password) {
            await MockServices.delay();

            // Check if user exists
            const user = MOCK_DATA.users[username];

            if (!user) {
                return {
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    message: 'Usuario o contraseña incorrectos'
                };
            }

            // Check if account is locked
            if (user.locked) {
                return {
                    success: false,
                    error: 'ACCOUNT_LOCKED',
                    message: 'Tu cuenta ha sido bloqueada temporalmente. Contacta con soporte.'
                };
            }

            // Track login attempts
            if (!this.loginAttempts[username]) {
                this.loginAttempts[username] = 0;
            }

            // Check password
            if (user.password !== password) {
                this.loginAttempts[username]++;

                if (this.loginAttempts[username] >= 3) {
                    user.locked = true;
                    return {
                        success: false,
                        error: 'ACCOUNT_LOCKED',
                        message: 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada.'
                    };
                }

                return {
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    message: `Usuario o contraseña incorrectos. Intentos restantes: ${3 - this.loginAttempts[username]}`
                };
            }

            // Successful login
            this.loginAttempts[username] = 0;
            return {
                success: true,
                user: {
                    username: user.username,
                    name: user.name,
                    dni: user.dni,
                    email: user.email,
                    phone: user.phone,
                    address: user.address
                },
                token: 'mock-jwt-token-' + Date.now()
            };
        },

        async logout() {
            await MockServices.delay(300);
            return { success: true };
        },

        async validateSession(token) {
            await MockServices.delay(200);

            if (!token || !token.startsWith('mock-jwt-token-')) {
                return {
                    success: false,
                    error: 'SESSION_EXPIRED',
                    message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                };
            }

            return { success: true };
        }
    },

    // Transfer Service
    TransferService: {
        dailyTransferred: 0,

        async transfer(data) {
            await MockServices.delay(1200);

            const { sourceAccountId, destinationAccount, amount, description, type } = data;

            // Validate amount
            if (amount < MOCK_DATA.transferLimits.minimumAmount) {
                return {
                    success: false,
                    error: 'INVALID_AMOUNT',
                    message: `El monto mínimo para transferir es $${MOCK_DATA.transferLimits.minimumAmount}`
                };
            }

            // Check per-transfer limit
            if (amount > MOCK_DATA.transferLimits.perTransferLimit) {
                return {
                    success: false,
                    error: 'LIMIT_EXCEEDED',
                    message: `El monto máximo por transferencia es $${MOCK_DATA.transferLimits.perTransferLimit.toLocaleString('es-AR')}`
                };
            }

            // Check daily limit
            if (this.dailyTransferred + amount > MOCK_DATA.transferLimits.dailyLimit) {
                return {
                    success: false,
                    error: 'DAILY_LIMIT_EXCEEDED',
                    message: `Has excedido el límite diario de transferencias ($${MOCK_DATA.transferLimits.dailyLimit.toLocaleString('es-AR')})`
                };
            }

            // Get source account
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const accounts = MOCK_DATA.accounts[currentUser.username];
            const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);

            if (!sourceAccount) {
                return {
                    success: false,
                    error: 'INVALID_ACCOUNT',
                    message: 'Cuenta origen no válida'
                };
            }

            // Check sufficient funds
            if (sourceAccount.balance < amount) {
                return {
                    success: false,
                    error: 'INSUFFICIENT_FUNDS',
                    message: 'Saldo insuficiente en la cuenta origen'
                };
            }

            // Validate destination account for third-party transfers
            if (type === 'third-party') {
                // Simulate validation of CBU/Alias
                if (destinationAccount.length < 10) {
                    return {
                        success: false,
                        error: 'INVALID_DESTINATION',
                        message: 'CBU o Alias de destino no válido'
                    };
                }

                // Simulate random error for specific CBU (for testing)
                if (destinationAccount === '0000000000000000000000') {
                    return {
                        success: false,
                        error: 'INVALID_DESTINATION',
                        message: 'La cuenta destino no existe o no puede recibir transferencias'
                    };
                }
            }

            // Process transfer
            sourceAccount.balance -= amount;
            this.dailyTransferred += amount;

            // Add transaction to history
            const transaction = {
                id: 'TXN' + Date.now(),
                date: new Date(),
                description: description || `Transferencia ${type === 'own' ? 'entre cuentas propias' : 'a terceros'}`,
                amount: -amount,
                type: 'debit',
                account: sourceAccountId
            };

            if (!MOCK_DATA.transactions[currentUser.username]) {
                MOCK_DATA.transactions[currentUser.username] = [];
            }
            MOCK_DATA.transactions[currentUser.username].unshift(transaction);

            // If transfer to own account, credit destination
            if (type === 'own') {
                const destAccount = accounts.find(acc => acc.id === destinationAccount);
                if (destAccount) {
                    destAccount.balance += amount;

                    const creditTransaction = {
                        id: 'TXN' + (Date.now() + 1),
                        date: new Date(),
                        description: description || 'Transferencia entre cuentas propias',
                        amount: amount,
                        type: 'credit',
                        account: destinationAccount
                    };
                    MOCK_DATA.transactions[currentUser.username].unshift(creditTransaction);
                }
            }

            return {
                success: true,
                transaction: {
                    id: transaction.id,
                    date: transaction.date,
                    amount: amount,
                    sourceAccount: sourceAccount.displayNumber,
                    destinationAccount: type === 'own'
                        ? accounts.find(acc => acc.id === destinationAccount)?.displayNumber
                        : destinationAccount,
                    description: transaction.description
                },
                message: 'Transferencia realizada exitosamente'
            };
        },

        resetDailyLimit() {
            this.dailyTransferred = 0;
        }
    },

    // Fixed Deposit Service
    FixedDepositService: {
        async createDeposit(data) {
            await MockServices.delay(1000);

            const { sourceAccountId, amount, term } = data;

            // Validate minimum amount
            if (amount < MOCK_DATA.depositLimits.minimumAmount) {
                return {
                    success: false,
                    error: 'MINIMUM_AMOUNT',
                    message: `El monto mínimo para un plazo fijo es $${MOCK_DATA.depositLimits.minimumAmount.toLocaleString('es-AR')}`
                };
            }

            // Get current user
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const accounts = MOCK_DATA.accounts[currentUser.username];
            const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);

            if (!sourceAccount) {
                return {
                    success: false,
                    error: 'INVALID_ACCOUNT',
                    message: 'Cuenta origen no válida'
                };
            }

            // Check sufficient funds
            if (sourceAccount.balance < amount) {
                return {
                    success: false,
                    error: 'INSUFFICIENT_FUNDS',
                    message: 'Saldo insuficiente en la cuenta origen'
                };
            }

            // Check maximum active deposits
            const activeDeposits = MOCK_DATA.fixedDeposits[currentUser.username] || [];
            if (activeDeposits.filter(d => d.status === 'active').length >= MOCK_DATA.depositLimits.maximumActive) {
                return {
                    success: false,
                    error: 'MAX_DEPOSITS_REACHED',
                    message: `No puedes tener más de ${MOCK_DATA.depositLimits.maximumActive} plazos fijos activos`
                };
            }

            // Calculate interest
            const rate = MOCK_DATA.interestRates[term];
            const interest = (amount * rate * term) / (365 * 100);

            // Create deposit
            const startDate = new Date();
            const maturityDate = new Date(startDate.getTime() + term * 24 * 60 * 60 * 1000);

            const deposit = {
                id: 'FD' + Date.now(),
                amount: amount,
                term: term,
                rate: rate,
                startDate: startDate,
                maturityDate: maturityDate,
                estimatedInterest: interest,
                status: 'active'
            };

            // Deduct from account
            sourceAccount.balance -= amount;

            // Add to deposits
            if (!MOCK_DATA.fixedDeposits[currentUser.username]) {
                MOCK_DATA.fixedDeposits[currentUser.username] = [];
            }
            MOCK_DATA.fixedDeposits[currentUser.username].push(deposit);

            // Add transaction
            const transaction = {
                id: 'TXN' + Date.now(),
                date: new Date(),
                description: `Plazo fijo ${term} días`,
                amount: -amount,
                type: 'debit',
                account: sourceAccountId
            };

            if (!MOCK_DATA.transactions[currentUser.username]) {
                MOCK_DATA.transactions[currentUser.username] = [];
            }
            MOCK_DATA.transactions[currentUser.username].unshift(transaction);

            return {
                success: true,
                deposit: deposit,
                message: 'Plazo fijo creado exitosamente'
            };
        },

        async getActiveDeposits() {
            await MockServices.delay(500);

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const deposits = MOCK_DATA.fixedDeposits[currentUser.username] || [];

            return {
                success: true,
                deposits: deposits.filter(d => d.status === 'active')
            };
        },

        calculateInterest(amount, term) {
            const rate = MOCK_DATA.interestRates[term];
            return (amount * rate * term) / (365 * 100);
        },

        async cancelDeposit(id) {
            await MockServices.delay(800);

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const deposits = MOCK_DATA.fixedDeposits[currentUser.username] || [];
            const deposit = deposits.find(d => d.id === id);

            if (!deposit) {
                return { success: false, message: 'Plazo fijo no encontrado' };
            }

            if (deposit.status !== 'active') {
                return { success: false, message: 'El plazo fijo no está activo' };
            }

            // Refund logic (Principal only, no interest penalty for simplicity in this mock, or implement penalty)
            // For MVP: Refund full principal.
            const accounts = MOCK_DATA.accounts[currentUser.username];
            // Find account. Assuming it goes back to checking or first account if source unknown, 
            // but we don't store source in deposit object in this mock. Let's pick the first account.
            const targetAccount = accounts[0];

            targetAccount.balance += deposit.amount;
            deposit.status = 'cancelled';

            // Add transaction
            if (!MOCK_DATA.transactions[currentUser.username]) {
                MOCK_DATA.transactions[currentUser.username] = [];
            }
            MOCK_DATA.transactions[currentUser.username].unshift({
                id: 'TXN' + Date.now(),
                date: new Date(),
                description: `Cancelación Plazo Fijo ${deposit.term} días`,
                amount: deposit.amount,
                type: 'credit',
                account: targetAccount.id
            });

            return { success: true, message: 'Plazo fijo cancelado exitosamente. El dinero se acreditó en tu cuenta.' };
        }
    },

    // Loan Service
    LoanService: {
        async createLoan(data) {
            await MockServices.delay(1500);
            const { amount, installments, destinationAccountId } = data;

            // Hardcoded max amount for loans
            const MAX_LOAN = 500000;
            if (amount > MAX_LOAN) {
                return { success: false, message: `El monto máximo de préstamo es $${MAX_LOAN.toLocaleString('es-AR')}` };
            }

            // Interest calculations (Simple fixed rate for demo)
            const RATE = 0.65; // 65% annual
            const totalToPay = amount * (1 + (RATE * (installments / 12)));
            const installmentAmount = totalToPay / installments;

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const accounts = MOCK_DATA.accounts[currentUser.username];
            const targetAccount = accounts.find(a => a.id === destinationAccountId);

            if (!targetAccount) {
                return { success: false, message: 'Cuenta destino inválida' };
            }

            targetAccount.balance += amount;

            // Add transaction
            if (!MOCK_DATA.transactions[currentUser.username]) {
                MOCK_DATA.transactions[currentUser.username] = [];
            }
            MOCK_DATA.transactions[currentUser.username].unshift({
                id: 'TXN' + Date.now(),
                date: new Date(),
                description: `Préstamo Personal a ${installments} cuotas`,
                amount: amount,
                type: 'credit',
                account: targetAccount.id
            });

            // Store loan (mock persistence)
            if (!MOCK_DATA.loans) MOCK_DATA.loans = {};
            if (!MOCK_DATA.loans[currentUser.username]) MOCK_DATA.loans[currentUser.username] = [];

            MOCK_DATA.loans[currentUser.username].push({
                id: 'LN' + Date.now(),
                amount: amount,
                installments: installments,
                installmentAmount: installmentAmount,
                startDate: new Date(),
                status: 'active'
            });

            return { success: true, message: 'Préstamo acreditado exitosamente' };
        },

        async getActiveLoans() {
            await MockServices.delay(500);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!MOCK_DATA.loans) MOCK_DATA.loans = {}; // Ensure initialization
            const loans = MOCK_DATA.loans[currentUser.username] || [];
            return { success: true, loans: loans.filter(l => l.status === 'active') };
        },

        async payOffLoan(loanId, sourceAccountId) {
            await MockServices.delay(1000);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const loans = MOCK_DATA.loans[currentUser.username] || [];
            const loan = loans.find(l => l.id === loanId);

            if (!loan || loan.status !== 'active') {
                return { success: false, message: 'Préstamo no válido o ya pagado' };
            }

            // Calculate total payoff (remaining installments * amount)
            // Simplified: Pay full remaining amount implies full interest for term (no discount)
            const payoffAmount = loan.installments * loan.installmentAmount;

            const accounts = MOCK_DATA.accounts[currentUser.username];
            const sourceAccount = accounts.find(a => a.id === sourceAccountId);

            if (!sourceAccount) {
                return { success: false, message: 'Cuenta de pago inválida' };
            }

            if (sourceAccount.balance < payoffAmount) {
                return { success: false, message: 'Saldo insuficiente para cancelar el préstamo' };
            }

            sourceAccount.balance -= payoffAmount;
            loan.status = 'paid';

            // Add transaction
            if (!MOCK_DATA.transactions[currentUser.username]) {
                MOCK_DATA.transactions[currentUser.username] = [];
            }
            MOCK_DATA.transactions[currentUser.username].unshift({
                id: 'TXN' + Date.now(),
                date: new Date(),
                description: `Cancelación Total de Préstamo`,
                amount: -payoffAmount,
                type: 'debit',
                account: sourceAccountId
            });

            return { success: true, message: 'Préstamo cancelado exitosamente' };
        },

        async retractLoan(loanId, sourceAccountId) {
            await MockServices.delay(1000);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const loans = MOCK_DATA.loans[currentUser.username] || [];
            const loan = loans.find(l => l.id === loanId);

            if (!loan || loan.status !== 'active') {
                return { success: false, message: 'Préstamo no válido' };
            }

            // Check if within 10 days
            const loanDate = new Date(loan.startDate);
            const today = new Date();
            const diffTime = Math.abs(today - loanDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 10) {
                return { success: false, message: 'El plazo de 10 días para desistir ha expirado' };
            }

            // Refund logic: Pay back the PRINCIPAL amount (no interest usually for retraction/cooling off)
            // User request was ambiguous on math, but "Desistir" usually implies reversing operation.
            // We will debit the original loan amount.
            const retractAmount = loan.amount;

            const accounts = MOCK_DATA.accounts[currentUser.username];
            const sourceAccount = accounts.find(a => a.id === sourceAccountId);

            if (!sourceAccount) {
                return { success: false, message: 'Cuenta de pago inválida' };
            }

            if (sourceAccount.balance < retractAmount) {
                return { success: false, message: 'Saldo insuficiente para desistir del préstamo' };
            }

            sourceAccount.balance -= retractAmount;
            loan.status = 'retracted'; // Or 'cancelled'

            // Add transaction
            if (!MOCK_DATA.transactions[currentUser.username]) {
                MOCK_DATA.transactions[currentUser.username] = [];
            }
            MOCK_DATA.transactions[currentUser.username].unshift({
                id: 'TXN' + Date.now(),
                date: new Date(),
                description: `Desistimiento de Préstamo (Revocación)`,
                amount: -retractAmount,
                type: 'debit',
                account: sourceAccountId
            });

            return { success: true, message: 'Has desistido del préstamo exitosamente' };
        }
    },

    // System Service (Reset Data)
    SystemService: {
        async resetData() {
            await MockServices.delay(1500);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            // Reset Accounts to initial high values
            if (MOCK_DATA.accounts[currentUser.username]) {
                const accounts = MOCK_DATA.accounts[currentUser.username];
                // Reset typical testing accounts
                if (accounts[0]) accounts[0].balance = 500000.00; // Checking
                if (accounts[1]) accounts[1].balance = 250000.00; // Savings
                if (accounts[2]) accounts[2].balance = 45000.00; // Credit Card (Reset to initial available)
                // Actually for credit card in this mock 'balance' usually meant 'spent' or 'debt'. 
                // Let's look at mockData: Credit card balance 45000, limit 150000. 
                // So balance is debt. Let's clear debt.
                if (accounts[2] && accounts[2].type.includes('Crédito')) accounts[2].balance = 45000.00;
            }

            return { success: true, message: 'Simulador restablecido: Fondos recargados' };
        }
    },

    // Client Service
    ClientService: {
        async getClientData() {
            await MockServices.delay(600);

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            // Simulate random service error (5% chance)
            // if (Math.random() < 0.05) {
            //     return {
            //         success: false,
            //         error: 'SERVICE_UNAVAILABLE',
            //         message: 'El servicio no está disponible temporalmente. Intenta nuevamente.'
            //     };
            // }

            const user = MOCK_DATA.users[currentUser.username];
            const accounts = MOCK_DATA.accounts[currentUser.username] || [];
            const cards = MOCK_DATA.cards[currentUser.username] || [];

            return {
                success: true,
                data: {
                    personalInfo: {
                        name: user.name,
                        dni: user.dni,
                        email: user.email,
                        phone: user.phone,
                        address: user.address
                    },
                    accounts: accounts,
                    cards: cards
                }
            };
        },

        async getAccounts() {
            await MockServices.delay(400);

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const accounts = MOCK_DATA.accounts[currentUser.username] || [];

            return {
                success: true,
                accounts: accounts
            };
        },

        async getTransactions(limit = 10) {
            await MockServices.delay(500);

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const transactions = MOCK_DATA.transactions[currentUser.username] || [];

            return {
                success: true,
                transactions: transactions.slice(0, limit)
            };
        }
    },

    // ===== Payment Services =====
    PaymentService: {
        async payService(serviceId, amount, accountId) {
            await MockServices.delay(1200);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const accounts = MOCK_DATA.accounts[currentUser.username];
            const account = accounts.find(a => a.id === accountId);
            const service = MOCK_DATA.services.find(s => s.id === serviceId);

            if (!account) {
                return { success: false, error: 'INVALID_ACCOUNT', message: 'Cuenta inválida' };
            }

            if (!service) {
                return { success: false, error: 'INVALID_SERVICE', message: 'Servicio no encontrado' };
            }

            if (amount <= 0) {
                return { success: false, error: 'INVALID_AMOUNT', message: 'El monto debe ser mayor a $0' };
            }

            if (account.balance < amount) {
                return { success: false, error: 'INSUFFICIENT_FUNDS', message: 'Saldo insuficiente' };
            }

            // Process payment
            account.balance -= amount;

            // Add transaction
            if (!MOCK_DATA.transactions[currentUser.username]) {
                MOCK_DATA.transactions[currentUser.username] = [];
            }
            MOCK_DATA.transactions[currentUser.username].unshift({
                id: 'TXN' + Date.now(),
                date: new Date(),
                description: `Pago ${service.name} - ${service.company}`,
                amount: -amount,
                type: 'debit',
                account: accountId
            });

            return {
                success: true,
                message: `Pago de ${service.name} realizado exitosamente`,
                receipt: {
                    id: 'REC' + Date.now(),
                    service: service.name,
                    company: service.company,
                    amount: amount,
                    date: new Date(),
                    account: account.displayNumber
                }
            };
        }
    },

    // ===== Virtual Card Service =====
    CardService: {
        async generateVirtualCard(linkedAccountId) {
            await MockServices.delay(1500);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const accounts = MOCK_DATA.accounts[currentUser.username];
            const account = accounts.find(a => a.id === linkedAccountId);

            if (!account) {
                return { success: false, error: 'INVALID_ACCOUNT', message: 'Cuenta inválida' };
            }

            if (!MOCK_DATA.virtualCards[currentUser.username]) {
                MOCK_DATA.virtualCards[currentUser.username] = [];
            }

            // Check if this account already has a virtual card
            const existingCard = MOCK_DATA.virtualCards[currentUser.username].find(c => c.linkedAccount === linkedAccountId);
            if (existingCard) {
                return { success: false, error: 'ALREADY_HAS_CARD', message: 'Esta cuenta ya posee una tarjeta virtual activa.' };
            }

            // Generate random card details
            const cardNumber = '4' + Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
            const cvv = Math.floor(Math.random() * 900 + 100).toString();
            const expiryMonth = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
            const expiryYear = (new Date().getFullYear() + 3).toString().slice(-2);

            const newCard = {
                id: 'VCARD' + Date.now(),
                number: cardNumber,
                displayNumber: '**** **** **** ' + cardNumber.slice(-4),
                fullNumber: cardNumber.match(/.{1,4}/g).join(' '),
                cvv: cvv,
                expiryDate: `${expiryMonth}/${expiryYear}`,
                linkedAccount: linkedAccountId,
                createdDate: new Date(),
                status: 'active'
            };

            MOCK_DATA.virtualCards[currentUser.username].push(newCard);

            return {
                success: true,
                message: 'Tarjeta virtual generada exitosamente',
                card: newCard
            };
        },

        async deleteVirtualCard(cardId) {
            await MockServices.delay(800);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            if (!MOCK_DATA.virtualCards[currentUser.username]) {
                return { success: false, message: 'No se encontró la tarjeta' };
            }

            const cardIndex = MOCK_DATA.virtualCards[currentUser.username].findIndex(c => c.id === cardId);

            if (cardIndex === -1) {
                return { success: false, message: 'Tarjeta no encontrada' };
            }

            MOCK_DATA.virtualCards[currentUser.username].splice(cardIndex, 1);

            return {
                success: true,
                message: 'Tarjeta virtual eliminada exitosamente'
            };
        },

        getVirtualCards() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            return MOCK_DATA.virtualCards[currentUser.username] || [];
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockServices;
}

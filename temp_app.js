// ===== Main Application Controller =====

const App = {
    currentUser: null,
    currentView: 'dashboard',

    // Initialize application
    init() {
        console.log('Initializing Home Banking App...');

        // Check if user is logged in
        const savedUser = Utils.storage.get('currentUser');
        const rememberMe = Utils.storage.get('rememberMe');

        if (savedUser && rememberMe) {
            this.currentUser = savedUser;
            this.showAppView();
        } else {
            this.showLoginView();
        }

        this.attachEventListeners();
    },

    // Show login view
    showLoginView() {
        document.getElementById('login-view').classList.add('active');
        document.getElementById('app-view').classList.remove('active');
    },

    // Show app view
    showAppView() {
        document.getElementById('login-view').classList.remove('active');
        document.getElementById('app-view').classList.add('active');

        // Update user name
        document.getElementById('user-name').textContent = this.currentUser.name;

        // Load dashboard data
        this.loadDashboard();
    },

    // Attach all event listeners
    attachEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Menu navigation
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Balance toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-balance');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleBalance(e));
        });

        // Transfer form
        const transferForm = document.getElementById('transfer-form');
        if (transferForm) {
            transferForm.addEventListener('submit', (e) => this.handleTransfer(e));

            // Transfer type change
            const transferType = document.getElementById('transfer-type');
            transferType.addEventListener('change', (e) => this.handleTransferTypeChange(e));
        }

        // Fixed deposit form
        const depositForm = document.getElementById('fixed-deposit-form');
        if (depositForm) {
            depositForm.addEventListener('submit', (e) => this.handleFixedDeposit(e));

            // Calculate interest on amount/term change
            const depositAmount = document.getElementById('deposit-amount');
            const depositTerm = document.getElementById('deposit-term');

            depositAmount.addEventListener('input', Utils.debounce(() => this.updateDepositCalculation(), 300));
            depositTerm.addEventListener('change', () => this.updateDepositCalculation());
        }

        // Loan form
        const loanForm = document.getElementById('loan-form');
        if (loanForm) {
            loanForm.addEventListener('submit', (e) => this.handleLoanRequest(e));
        }
    },

    // Handle login
    async handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        const loginBtn = document.getElementById('login-btn');

        Utils.hideError('login-error');
        Utils.setButtonLoading(loginBtn, true);

        try {
            const result = await MockServices.AuthService.login(username, password);

            if (result.success) {
                this.currentUser = result.user;
                Utils.storage.set('currentUser', result.user);
                Utils.storage.set('authToken', result.token);
                Utils.storage.set('rememberMe', rememberMe);

                Utils.toast.success('¡Bienvenido! Inicio de sesión exitoso');

                setTimeout(() => {
                    this.showAppView();
                }, 500);
            } else {
                Utils.showError('login-error', result.message);
            }
        } catch (error) {
            Utils.showError('login-error', 'Error al iniciar sesión. Intenta nuevamente.');
        } finally {
            Utils.setButtonLoading(loginBtn, false);
        }
    },

    // Handle logout
    async handleLogout() {
        Utils.modal.show(
            'Cerrar Sesión',
            '<p>¿Estás seguro que deseas cerrar sesión?</p>',
            async () => {
                await MockServices.AuthService.logout();

                Utils.storage.remove('currentUser');
                Utils.storage.remove('authToken');
                Utils.storage.remove('rememberMe');

                this.currentUser = null;
                this.showLoginView();

                // Reset form
                document.getElementById('login-form').reset();
                Utils.hideError('login-error');

                Utils.toast.info('Sesión cerrada correctamente');
            }
        );
    },

    // Switch between views
    switchView(view) {
        // Update menu active state
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const menuItem = document.querySelector(`[data-view="${view}"]`);
        if (menuItem) menuItem.classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        const section = document.getElementById(`${view}-section`);
        if (section) section.classList.add('active');

        this.currentView = view;

        // Load view-specific data
        switch (view) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'transfer':
                this.loadTransferView();
                break;
            case 'fixed-deposit':
                this.loadFixedDepositView();
                break;
            case 'client-data':
                this.loadClientData();
                break;
            case 'loans':
                this.loadLoansView();
                break;
            case 'services':
                this.loadServicesView();
                break;
            case 'cards':
                this.loadCardsView();
                break;
        }
    },

    // Toggle balance visibility
    toggleBalance(e) {
        const button = e.currentTarget;
        const accountType = button.getAttribute('data-account');
        const balanceElement = document.querySelector(`[data-balance="${accountType}"] .balance-amount`);

        if (balanceElement) balanceElement.classList.toggle('hidden-balance');
    },

    // Load dashboard data
    async loadDashboard() {
        try {
            // Inject Reset Button (if not exists)
            this.injectResetButton();

            // Load accounts
            const accountsResult = await MockServices.ClientService.getAccounts();
            if (accountsResult.success) {
                this.displayAccounts(accountsResult.accounts);
            }

            // Load recent transactions
            const transactionsResult = await MockServices.ClientService.getTransactions(10);
            if (transactionsResult.success) {
                this.displayTransactions(transactionsResult.transactions);
            }
        } catch (error) {
            Utils.toast.error('Error al cargar datos del dashboard');
        }
    },

    injectResetButton() {
        const header = document.querySelector('.section-header');
        if (header && !document.getElementById('reset-demo-btn')) {
            const btn = document.createElement('button');
            btn.id = 'reset-demo-btn';
            btn.className = 'btn btn-sm btn-secondary';
            btn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.5rem;">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                </svg>
                Restablecer Saldos
            `;
            btn.onclick = () => this.handleResetSystem();
            btn.style.marginTop = '0.5rem';
            header.appendChild(btn);
        }
    },

    // Display accounts
    displayAccounts(accounts) {
        const accountCards = document.querySelectorAll('.account-card');

        accounts.forEach((account, index) => {
            if (accountCards[index]) {
                const balanceValue = accountCards[index].querySelector('.balance-value');
                if (balanceValue) {
                    const currentBalance = parseFloat(balanceValue.textContent.replace(/[^0-9.-]/g, '')) || 0;
                    Utils.animateNumber(balanceValue, currentBalance, account.balance);
                }
            }
        });
    },

    // Display transactions
    displayTransactions(transactions) {
        const container = document.getElementById('recent-transactions');
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">No hay movimientos recientes</p>';
            return;
        }

        container.innerHTML = transactions.map(txn => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${txn.description}</div>
                    <div class="transaction-date">${Utils.formatRelativeDate(txn.date)}</div>
                </div>
                <div class="transaction-amount ${txn.type === 'credit' ? 'positive' : 'negative'}">
                    ${txn.amount >= 0 ? '+' : ''}${Utils.formatCurrency(txn.amount)}
                </div>
            </div>
        `).join('');
    },

    // Load transfer view
    async loadTransferView() {
        try {
            const result = await MockServices.ClientService.getAccounts();
            if (result.success) {
                this.populateAccountDropdowns(result.accounts);
            }
        } catch (error) {
            Utils.toast.error('Error al cargar cuentas');
        }
    },

    // Populate account dropdowns
    populateAccountDropdowns(accounts) {
        const sourceSelect = document.getElementById('source-account');
        const destOwnSelect = document.getElementById('destination-own-account');
        const depositSourceSelect = document.getElementById('deposit-source-account');

        // Filter only checking and savings accounts (not credit cards)
        const validAccounts = accounts.filter(acc => acc.type !== 'Tarjeta de Crédito');

        const accountOptions = validAccounts.map(acc =>
            `<option value="${acc.id}">${acc.type} ${acc.displayNumber} - ${Utils.formatCurrency(acc.balance)}</option>`
        ).join('');

        if (sourceSelect) {
            sourceSelect.innerHTML = accountOptions;
        }

        if (destOwnSelect) {
            destOwnSelect.innerHTML = accountOptions;
        }

        if (depositSourceSelect) {
            depositSourceSelect.innerHTML = accountOptions;
        }
    },

    // Handle transfer type change
    handleTransferTypeChange(e) {
        const type = e.target.value;
        const ownGroup = document.getElementById('destination-own-group');
        const thirdPartyGroup = document.getElementById('destination-third-party-group');
        const destOwnAccount = document.getElementById('destination-own-account');
        const destThirdParty = document.getElementById('destination-account-number');

        if (type === 'own') {
            ownGroup?.classList.remove('hidden');
            thirdPartyGroup?.classList.add('hidden');
            if (destOwnAccount) destOwnAccount.required = true;
            if (destThirdParty) destThirdParty.required = false;
        } else {
            ownGroup?.classList.add('hidden');
            thirdPartyGroup?.classList.remove('hidden');
            if (destOwnAccount) destOwnAccount.required = false;
            if (destThirdParty) destThirdParty.required = true;
        }
    },

    // Handle transfer
    async handleTransfer(e) {
        e.preventDefault();

        const type = document.getElementById('transfer-type').value;
        const sourceAccountId = document.getElementById('source-account').value;
        const amount = parseFloat(document.getElementById('transfer-amount').value);
        const description = document.getElementById('transfer-description').value;

        let destinationAccount;
        if (type === 'own') {
            destinationAccount = document.getElementById('destination-own-account').value;
        } else {
            destinationAccount = document.getElementById('destination-account-number').value;
        }

        // Validate source and destination are different for own transfers
        if (type === 'own' && sourceAccountId === destinationAccount) {
            Utils.showError('transfer-error', 'La cuenta origen y destino no pueden ser la misma');
            return;
        }

        Utils.hideError('transfer-error');

        // Show confirmation modal
        const accounts = MOCK_DATA.accounts[this.currentUser.username];
        const sourceAcc = accounts.find(acc => acc.id === sourceAccountId);
        let destDisplay = destinationAccount;

        if (type === 'own') {
            const destAcc = accounts.find(acc => acc.id === destinationAccount);
            destDisplay = `${destAcc.type} ${destAcc.displayNumber}`;
        }

        Utils.modal.show(
            'Confirmar Transferencia',
            `
                <div class="summary-row">
                    <span>Cuenta origen:</span>
                    <span class="summary-value">${sourceAcc.type} ${sourceAcc.displayNumber}</span>
                </div>
                <div class="summary-row">
                    <span>Cuenta destino:</span>
                    <span class="summary-value">${destDisplay}</span>
                </div>
                <div class="summary-row">
                    <span>Monto:</span>
                    <span class="summary-value highlight">${Utils.formatCurrency(amount)}</span>
                </div>
                ${description ? `
                <div class="summary-row">
                    <span>Descripción:</span>
                    <span class="summary-value">${description}</span>
                </div>
                ` : ''}
            `,
            async () => {
                const transferBtn = document.querySelector('#transfer-form button[type="submit"]');
                Utils.setButtonLoading(transferBtn, true);

                try {
                    const result = await MockServices.TransferService.transfer({
                        sourceAccountId,
                        destinationAccount,
                        amount,
                        description,
                        type
                    });

                    if (result.success) {
                        Utils.toast.success(result.message);
                        document.getElementById('transfer-form').reset();

                        // Reload dashboard data
                        await this.loadDashboard();
                    } else {
                        Utils.showError('transfer-error', result.message);
                    }
                } catch (error) {
                    Utils.showError('transfer-error', 'Error al procesar la transferencia');
                } finally {
                    Utils.setButtonLoading(transferBtn, false);
                }
            }
        );
    },

    // Load fixed deposit view
    async loadFixedDepositView() {
        try {
            // Load accounts for dropdown
            const accountsResult = await MockServices.ClientService.getAccounts();
            if (accountsResult.success) {
                this.populateAccountDropdowns(accountsResult.accounts);
            }

            // Load active deposits
            const depositsResult = await MockServices.FixedDepositService.getActiveDeposits();
            if (depositsResult.success) {
                this.displayActiveDeposits(depositsResult.deposits);
            }
        } catch (error) {
            Utils.toast.error('Error al cargar plazos fijos');
        }
    },

    // Display active deposits
    displayActiveDeposits(deposits) {
        const container = document.getElementById('active-deposits-list');
        if (!container) return;

        if (deposits.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No tienes plazos fijos activos</p>';
            return;
        }

        container.innerHTML = deposits.map(deposit => `
            <div class="deposit-item">
                <div class="deposit-header">
                    <span class="deposit-amount-display">${Utils.formatCurrency(deposit.amount)}</span>
                    <span style="color: var(--text-tertiary); font-size: var(--font-size-sm);">${deposit.term} días</span>
                </div>
                <div class="deposit-details">
                    <div>TNA: ${deposit.rate}%</div>
                    <div>Interés estimado: ${Utils.formatCurrency(deposit.estimatedInterest)}</div>
                    <div>Fecha de inicio: ${Utils.formatDate(deposit.startDate)}</div>
                    <div>Vencimiento: ${Utils.formatDate(deposit.maturityDate)}</div>
                    <div style="color: var(--success); font-weight: 600;">Total al vencimiento: ${Utils.formatCurrency(deposit.amount + deposit.estimatedInterest)}</div>
                </div>
                <div class="deposit-actions" style="margin-top: 1rem; text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick="App.handleCancelDeposit('${deposit.id}', ${deposit.amount})">Cancelar</button>
                </div>
            </div>
        `).join('');
    },

    // Update deposit calculation
    updateDepositCalculation() {
        const amount = parseFloat(document.getElementById('deposit-amount').value) || 0;
        const term = parseInt(document.getElementById('deposit-term').value) || 30;

        const estInterestEl = document.getElementById('estimated-interest');
        const totMaturityEl = document.getElementById('total-maturity');
        const matDateEl = document.getElementById('maturity-date');

        if (amount > 0) {
            const interest = MockServices.FixedDepositService.calculateInterest(amount, term);
            const total = amount + interest;

            const maturityDate = new Date();
            maturityDate.setDate(maturityDate.getDate() + term);

            if (estInterestEl) estInterestEl.textContent = Utils.formatCurrency(interest);
            if (totMaturityEl) totMaturityEl.textContent = Utils.formatCurrency(total);
            if (matDateEl) matDateEl.textContent = Utils.formatDate(maturityDate, 'long');
        } else {
            if (estInterestEl) estInterestEl.textContent = '$ 0.00';
            if (totMaturityEl) totMaturityEl.textContent = '$ 0.00';
            if (matDateEl) matDateEl.textContent = '-';
        }
    },

    // Handle fixed deposit creation
    async handleFixedDeposit(e) {
        e.preventDefault();

        const sourceAccountId = document.getElementById('deposit-source-account').value;
        const amount = parseFloat(document.getElementById('deposit-amount').value);
        const term = parseInt(document.getElementById('deposit-term').value);

        Utils.hideError('deposit-error');

        // Show confirmation modal
        const accounts = MOCK_DATA.accounts[this.currentUser.username];
        const sourceAcc = accounts.find(acc => acc.id === sourceAccountId);
        const interest = MockServices.FixedDepositService.calculateInterest(amount, term);
        const total = amount + interest;
        const maturityDate = new Date();
        maturityDate.setDate(maturityDate.getDate() + term);

        Utils.modal.show(
            'Confirmar Plazo Fijo',
            `
                <div class="summary-row">
                    <span>Cuenta origen:</span>
                    <span class="summary-value">${sourceAcc.type} ${sourceAcc.displayNumber}</span>
                </div>
                <div class="summary-row">
                    <span>Monto a invertir:</span>
                    <span class="summary-value">${Utils.formatCurrency(amount)}</span>
                </div>
                <div class="summary-row">
                    <span>Plazo:</span>
                    <span class="summary-value">${term} días</span>
                </div>
                <div class="summary-row">
                    <span>TNA:</span>
                    <span class="summary-value">${MOCK_DATA.interestRates[term]}%</span>
                </div>
                <div class="summary-row">
                    <span>Interés estimado:</span>
                    <span class="summary-value">${Utils.formatCurrency(interest)}</span>
                </div>
                <div class="summary-row">
                    <span>Total al vencimiento:</span>
                    <span class="summary-value highlight">${Utils.formatCurrency(total)}</span>
                </div>
                <div class="summary-row">
                    <span>Fecha de vencimiento:</span>
                    <span class="summary-value">${Utils.formatDate(maturityDate, 'long')}</span>
                </div>
            `,
            async () => {
                const depositBtn = document.querySelector('#fixed-deposit-form button[type="submit"]');
                Utils.setButtonLoading(depositBtn, true);

                try {
                    const result = await MockServices.FixedDepositService.createDeposit({
                        sourceAccountId,
                        amount,
                        term
                    });

                    if (result.success) {
                        Utils.toast.success(result.message);
                        document.getElementById('fixed-deposit-form').reset();
                        this.updateDepositCalculation();

                        // Reload view
                        await this.loadFixedDepositView();
                        await this.loadDashboard();
                    } else {
                        Utils.showError('deposit-error', result.message);
                    }
                } catch (error) {
                    Utils.showError('deposit-error', 'Error al crear el plazo fijo');
                } finally {
                    Utils.setButtonLoading(depositBtn, false);
                }
            }
        );
    },

    // Handle cancel deposit
    handleCancelDeposit(id, amount) {
        Utils.modal.show(
            'Cancelar Plazo Fijo',
            `
                <p>¿Estás seguro que deseas cancelar este plazo fijo?</p>
                <div class="summary-row">
                    <span>Monto a reintegrar:</span>
                    <span class="summary-value highlight">${Utils.formatCurrency(amount)}</span>
                </div>
                <p style="font-size: 0.9em; color: var(--text-tertiary); margin-top: 1rem;">
                    Nota: Se reintegrará únicamente el capital invertido.
                </p>
            `,
            async () => {
                const confirmBtn = document.getElementById('modal-confirm');
                Utils.setButtonLoading(confirmBtn, true);

                try {
                    const result = await MockServices.FixedDepositService.cancelDeposit(id);

                    if (result.success) {
                        Utils.toast.success(result.message);
                        await this.loadFixedDepositView();
                        await this.loadDashboard(); // Update balance
                    } else {
                        Utils.toast.error(result.message);
                    }
                } catch (error) {
                    Utils.toast.error('Error al cancelar el plazo fijo');
                } finally {
                    Utils.setButtonLoading(confirmBtn, false);
                }
            }
        );
    },

    // Load Loans view
    async loadLoansView() {
        try {
            const loanSourceSelect = document.getElementById('loan-destination-account');
            let debugInfo = document.getElementById('loans-debug-info');

            if (!loanSourceSelect) return;

            if (!debugInfo) {
                debugInfo = document.createElement('div');
                debugInfo.id = 'loans-debug-info';
                debugInfo.style.fontSize = '0.8rem';
                debugInfo.style.color = 'var(--text-tertiary)';
                debugInfo.style.marginTop = '0.5rem';
                loanSourceSelect.parentNode.appendChild(debugInfo);
            }

            loanSourceSelect.innerHTML = '<option value="" disabled selected>Cargando cuentas...</option>';

            const accountsResult = await MockServices.ClientService.getAccounts();
            if (accountsResult.success) {
                const allAccounts = accountsResult.accounts || [];
                const validAccounts = allAccounts.filter(acc =>
                    !acc.type.toLowerCase().includes('crédito') &&
                    !acc.type.toLowerCase().includes('credito')
                );

                if (validAccounts.length > 0) {
                    loanSourceSelect.innerHTML = validAccounts.map(acc =>
                        `<option value="${acc.id}">${acc.type} ${acc.displayNumber}</option>`
                    ).join('');
                } else {
                    loanSourceSelect.innerHTML = '<option value="DEBUG_ACC">Cuenta de Prueba (Debug)</option>';
                }

                if (debugInfo) debugInfo.textContent = `Info: ${allAccounts.length} total, ${validAccounts.length} válidas.`;
            } else {
                Utils.toast.error('Error al cargar cuentas');
            }

            const loansResult = await MockServices.LoanService.getActiveLoans();
            if (loansResult.success) {
                this.displayActiveLoans(loansResult.loans);
            }
        } catch (error) {
            Utils.toast.error('Error al cargar préstamos');
        }
    },

    displayActiveLoans(loans) {
        const container = document.getElementById('active-loans-list');
        if (!container) return;

        if (loans.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No tienes préstamos activos</p>';
            return;
        }

        container.innerHTML = loans.map(loan => {
            const loanDate = new Date(loan.startDate);
            const today = new Date();
            const diffTime = Math.abs(today - loanDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const canRetract = diffDays <= 10;

            let buttonsHtml = '';
            if (canRetract) {
                buttonsHtml += `<button class="btn btn-sm btn-danger" style="background-color: #dc3545; color: white; margin-right: 0.5rem;" onclick="App.handleRetractLoan('${loan.id}', ${loan.amount})">Desistir</button>`;
            }
            buttonsHtml += `<button class="btn btn-sm btn-secondary" onclick="App.handlePayOffLoan('${loan.id}', ${loan.installments * loan.installmentAmount})">Pagar Total</button>`;

            return `
            <div class="deposit-item">
                 <div class="deposit-header">
                    <span class="deposit-amount-display">${Utils.formatCurrency(loan.amount)}</span>
                    <div>${buttonsHtml}</div>
                </div>
                <div class="deposit-details">
                    <div>Cuotas: ${loan.installments}</div>
                    <div>Fecha: ${Utils.formatDate(loan.startDate)} (${diffDays} días)</div>
                    <div style="margin-top:0.5rem; font-weight:bold; color:var(--primary);">Total a Pagar: ${Utils.formatCurrency(loan.installments * loan.installmentAmount)}</div>
                </div>
            </div>`;
        }).join('');
    },

    async handleRetractLoan(loanId, originalAmount) {
        const accountsResult = await MockServices.ClientService.getAccounts();
        if (!accountsResult.success) {
            Utils.toast.error('Error al cargar cuentas');
            return;
        }

        const validAccounts = accountsResult.accounts.filter(acc => !acc.type.includes('Crédito') && acc.balance >= originalAmount);
        if (validAccounts.length === 0) {
            Utils.toast.error('No tienes cuentas con saldo suficiente para devolver el préstamo');
            return;
        }

        const options = validAccounts.map(acc => `<option value="${acc.id}">${acc.type} ${acc.displayNumber} ($${acc.balance})</option>`).join('');

        Utils.modal.show(
            'Desistir del Préstamo',
            `
                <p>Estás dentro del plazo de revocación (10 días).</p>
                <p>Puedes cancelar el préstamo devolviendo el <strong>monto original</strong> recibido.</p>
                <div class="summary-row">
                    <span>Monto a Devolver:</span>
                    <span class="summary-value highlight">${Utils.formatCurrency(originalAmount)}</span>
                </div>
                 <div class="form-group" style="margin-top:1rem;">
                    <label>Debitar de:</label>
                    <select id="retract-source-account" class="form-control" style="width:100%; padding:0.5rem;">
                        ${options}
                    </select>
                </div>`,
            async () => {
                const sourceId = document.getElementById('retract-source-account').value;
                const confirmBtn = document.getElementById('modal-confirm');
                Utils.setButtonLoading(confirmBtn, true);

                try {
                    const result = await MockServices.LoanService.retractLoan(loanId, sourceId);
                    if (result.success) {
                        Utils.toast.success(result.message);
                        await this.loadLoansView();
                        await this.loadDashboard();
                    } else {
                        Utils.toast.error(result.message);
                    }
                } catch (error) {
                    Utils.toast.error('Error al procesar la revocación');
                } finally {
                    Utils.setButtonLoading(confirmBtn, false);
                }
            }
        );
    },

    async handlePayOffLoan(loanId, totalAmount) {
        const accountsResult = await MockServices.ClientService.getAccounts();
        if (!accountsResult.success) {
            Utils.toast.error('Error al cargar cuentas para pago');
            return;
        }

        const validAccounts = accountsResult.accounts.filter(acc => !acc.type.includes('Crédito') && acc.balance >= totalAmount);
        if (validAccounts.length === 0) {
            Utils.toast.error('No tienes cuentas con saldo suficiente para cancelar este préstamo');
            return;
        }

        const options = validAccounts.map(acc => `<option value="${acc.id}">${acc.type} ${acc.displayNumber} ($${acc.balance})</option>`).join('');

        Utils.modal.show(
            'Cancelar Préstamo',
            `
                <p>¿Deseas cancelar totalmente este préstamo?</p>
                <div class="summary-row">
                    <span>Monto Total:</span>
                    <span class="summary-value highlight">${Utils.formatCurrency(totalAmount)}</span>
                </div>
                <div class="form-group" style="margin-top:1rem;">
                    <label>Pagar desde:</label>
                    <select id="payoff-source-account" class="form-control" style="width:100%; padding:0.5rem;">
                        ${options}
                    </select>
                </div>`,
            async () => {
                const sourceId = document.getElementById('payoff-source-account').value;
                const confirmBtn = document.getElementById('modal-confirm');
                Utils.setButtonLoading(confirmBtn, true);

                try {
                    const result = await MockServices.LoanService.payOffLoan(loanId, sourceId);
                    if (result.success) {
                        Utils.toast.success(result.message);
                        await this.loadLoansView();
                        await this.loadDashboard();
                    } else {
                        Utils.toast.error(result.message);
                    }
                } catch (error) {
                    Utils.toast.error('Error al procesar el pago');
                } finally {
                    Utils.setButtonLoading(confirmBtn, false);
                }
            }
        );
    },

    handleResetSystem() {
        Utils.modal.show(
            'Restablecer Simulador',
            '<p>¿Quieres recargar tus cuentas con fondos de prueba? Esto reiniciará tus saldos.</p>',
            async () => {
                const confirmBtn = document.getElementById('modal-confirm');
                Utils.setButtonLoading(confirmBtn, true);
                try {
                    const result = await MockServices.SystemService.resetData();
                    if (result.success) {
                        Utils.toast.success(result.message);
                        await this.loadDashboard();
                        if (this.currentView === 'loans') await this.loadLoansView();
                        if (this.currentView === 'fixed-deposit') await this.loadFixedDepositView();
                        if (this.currentView === 'transfer') await this.loadTransferView();
                    }
                } catch (e) {
                    Utils.toast.error('Error al resetear');
                } finally {
                    Utils.setButtonLoading(confirmBtn, false);
                }
            }
        );
    },

    async handleLoanRequest(e) {
        e.preventDefault();

        const destinationAccountId = document.getElementById('loan-destination-account').value;
        const amount = parseFloat(document.getElementById('loan-amount').value);
        const installments = parseInt(document.getElementById('loan-installments').value);

        Utils.hideError('loan-error');

        Utils.modal.show(
            'Confirmar Préstamo',
            `
                <div class="summary-row">
                    <span>Monto solicitado:</span>
                    <span class="summary-value">${Utils.formatCurrency(amount)}</span>
                </div>
                <div class="summary-row">
                    <span>Cuotas:</span>
                    <span class="summary-value">${installments}</span>
                </div>`,
            async () => {
                const loanBtn = document.querySelector('#loan-form button[type="submit"]');
                Utils.setButtonLoading(loanBtn, true);

                try {
                    const result = await MockServices.LoanService.createLoan({
                        amount,
                        installments,
                        destinationAccountId
                    });

                    if (result.success) {
                        Utils.toast.success(result.message);
                        document.getElementById('loan-form').reset();
                        await this.loadLoansView();
                        await this.loadDashboard();
                    } else {
                        Utils.showError('loan-error', result.message);
                    }
                } catch (error) {
                    Utils.showError('loan-error', 'Error al solicitar el préstamo');
                } finally {
                    Utils.setButtonLoading(loanBtn, false);
                }
            }
        );
    },

    async loadClientData() {
        try {
            const result = await MockServices.ClientService.getClientData();
            if (result.success) {
                this.displayClientData(result.data);
            } else {
                Utils.toast.error(result.message);
            }
        } catch (error) {
            Utils.toast.error('Error al cargar datos del cliente');
        }
    },

    displayClientData(data) {
        document.getElementById('client-name').textContent = data.personalInfo.name;
        document.getElementById('client-dni').textContent = data.personalInfo.dni;
        document.getElementById('client-email').textContent = data.personalInfo.email;
        document.getElementById('client-phone').textContent = data.personalInfo.phone;
        document.getElementById('client-address').textContent = data.personalInfo.address;

        const accountsList = document.getElementById('client-accounts-list');
        if (accountsList) accountsList.innerHTML = data.accounts.map(acc => `
            <div class="account-info">
                <div class="account-info-header">
                    <span class="account-info-type">${acc.type}</span>
                    <span class="account-info-balance">${Utils.formatCurrency(acc.balance)}</span>
                </div>
                <div class="account-info-number">${acc.number}</div>
                ${acc.cbu ? `<div style="font-size: var(--font-size-xs); color: var(--text-tertiary); margin-top: 0.25rem;">CBU: ${acc.cbu}</div>` : ''}
            </div>`).join('');

        const cardsList = document.getElementById('client-cards-list');
        if (cardsList) cardsList.innerHTML = data.cards.map(card => `
            <div class="card-info">
                <div class="card-info-header">
                    <span class="card-info-type">${card.brand} ${card.type}</span>
                    ${card.type === 'Crédito' ? `<span class="card-info-limit">${Utils.formatCurrency(card.available)}</span>` : ''}
                </div>
                <div class="card-info-number">${card.displayNumber}</div>
            </div>`).join('');
    },

    // ===== PAYMENT SERVICES =====
    async loadServicesView() {
        const serviceSelect = document.getElementById('service-select');
        const services = MOCK_DATA.services;
        const accounts = MOCK_DATA.accounts[this.currentUser.username];

        if (serviceSelect) serviceSelect.innerHTML = '<option value="">-- Selecciona un servicio --</option>' +
            services.map(service => `<option value="${service.id}">${service.icon} ${service.name} - ${service.company}</option>`).join('');

        const accountSelect = document.getElementById('service-account');
        if (accountSelect) accountSelect.innerHTML = accounts.map(acc => `<option value="${acc.id}">${acc.type} - ${acc.displayNumber}</option>`).join('');

        serviceSelect?.addEventListener('change', (e) => {
            const serviceId = e.target.value;
            const serviceDetails = document.getElementById('service-details');

            if (serviceId) {
                const service = services.find(s => s.id === serviceId);
                document.getElementById('service-icon-display').textContent = service.icon;
                document.getElementById('service-name-display').textContent = service.name;
                document.getElementById('service-company-display').textContent = service.company;
                document.getElementById('service-amount').value = service.suggestedAmount;
                document.getElementById('suggested-amount-text').textContent = `Monto sugerido: ${Utils.formatCurrency(service.suggestedAmount)}`;
                if (serviceDetails) serviceDetails.style.display = 'block';
            } else {
                if (serviceDetails) serviceDetails.style.display = 'none';
            }
        });

        const form = document.getElementById('service-payment-form');
        if (form) form.onsubmit = (e) => this.handleServicePayment(e);
    },

    async handleServicePayment(e) {
        e.preventDefault();
        const button = e.target.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('service-error');

        const serviceId = document.getElementById('service-select').value;
        const amount = parseFloat(document.getElementById('service-amount').value);
        const accountId = document.getElementById('service-account').value;

        if (errorDiv) errorDiv.textContent = '';
        Utils.setButtonLoading(button, true);

        try {
            const result = await MockServices.PaymentService.payService(serviceId, amount, accountId);

            if (result.success) {
                Utils.showToast('✅ ¡Pago Finalizado!', 'success');
                this.updateSidebarProducts();

                const service = MOCK_DATA.services.find(s => s.id === serviceId);
                const account = MOCK_DATA.accounts[this.currentUser.username].find(a => a.id === accountId);
                const receiptId = result.receipt.id.slice(-6);

                const successContainer = document.createElement('div');
                successContainer.className = 'payment-success-msg';
                successContainer.innerHTML = `
                    <div style="text-align: center; padding: var(--spacing-md); background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md); margin-top: var(--spacing-md);">
                        <p style="color: #10b981; font-weight: 600; margin-bottom: var(--spacing-sm);">¡Pago Finalizado con éxito!</p>
                        <button id="download-receipt-pdf" class="btn btn-secondary btn-sm" style="width: 100%;">📥 Descargar Comprobante PDF</button>
                    </div>`;

                const form = document.getElementById('service-payment-form');
                form?.appendChild(successContainer);

                document.getElementById('download-receipt-pdf')?.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    this.generatePDFReceipt({
                        id: receiptId,
                        service: service.name,
                        company: service.company,
                        cuit: service.cuit || '30-12345678-9',
                        amount: amount,
                        account: account.displayNumber,
                        accountType: account.type,
                        date: new Date().toLocaleDateString('es-AR'),
                        userName: this.currentUser.name,
                        userDni: this.currentUser.dni || 'XX.XXX.XXX',
                        period: new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date())
                    });
                });

                setTimeout(() => {
                    if (document.getElementById('service-payment-form')) {
                        document.getElementById('service-payment-form').reset();
                        const details = document.getElementById('service-details');
                        if (details) details.style.display = 'none';
                        successContainer.remove();
                    }
                }, 10000);

                this.loadDashboard();
            } else {
                if (errorDiv) errorDiv.textContent = `❌ Error: ${result.message}`;
                Utils.showToast(result.message, 'error');
            }
        } catch (error) {
            if (errorDiv) errorDiv.textContent = 'Error al procesar el pago';
        } finally {
            Utils.setButtonLoading(button, false);
        }
    },

    // ===== VIRTUAL CARDS =====
    async loadCardsView() {
        const cardsList = document.getElementById('virtual-cards-list');
        if (!cardsList) return;
        const cards = MockServices.CardService.getVirtualCards();
        const accounts = MOCK_DATA.accounts[this.currentUser.username];

        this.updateSidebarProducts();

        const accountSelect = document.getElementById('card-account-select');
        if (accountSelect) {
            const eligibleAccounts = accounts.filter(a => a.type !== 'Tarjeta de Crédito');
            accountSelect.innerHTML = eligibleAccounts.map(a => `<option value="${a.id}">${a.type} - ${a.displayNumber}</option>`).join('');
        }

        if (cards.length === 0) {
            cardsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💳</div>
                    <p>No tienes una tarjeta virtual activa</p>
                    <p class="hint-text">Genera tu tarjeta virtual para compras seguras en internet.</p>
                </div>`;
            const generateBtn = document.getElementById('generate-card-btn');
            if (generateBtn) generateBtn.style.display = 'block';
        } else {
            cardsList.innerHTML = cards.map(card => {
                const linkedAccount = accounts.find(a => a.id === card.linkedAccount);
                return `
                    <div class="premium-virtual-card">
                        <div class="card-glass-effect"></div>
                        <div class="card-chip"></div>
                        <div class="card-brand">VISA DEBIT</div>
                        <div class="card-number-section">
                            <div class="card-label">NÚMERO DE TARJETA</div>
                            <div class="card-number-display">${card.fullNumber || card.number}</div>
                        </div>
                        <div class="card-info-row">
                            <div class="card-item">
                                <span class="card-label">VENCIMIENTO</span>
                                <span class="card-value">${card.expiryDate}</span>
                            </div>
                            <div class="card-item">
                                <span class="card-label">CVV</span>
                                <span class="card-value">${card.cvv}</span>
                            </div>
                        </div>
                        <div class="card-holder">
                            <span class="card-label">TITULAR</span>
                            <span class="card-value">${this.currentUser.name.toUpperCase()}</span>
                        </div>
                        <div class="card-actions-overlay">
                            <button class="btn btn-sm btn-copy-full" data-card-number="${card.fullNumber || card.number}" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 5px 10px; cursor: pointer; border-radius: 4px; display: flex; align-items: center; gap: 5px;">
                                <span class="icon">📋</span> <span class="text">Copiar</span>
                            </button>
                            <button class="btn btn-sm btn-delete-card" data-card-id="${card.id}" style="background: rgba(255,80,80,0.4); border: 1px solid rgba(255,80,80,0.5); color: white; padding: 5px 10px; cursor: pointer; border-radius: 4px; display: flex; align-items: center; gap: 5px;">
                                <span class="icon">🗑️</span> <span class="text">Eliminar</span>
                            </button>
                        </div>
                        <div class="card-status-badge">ACTIVA - VINCULADA A ${linkedAccount.displayNumber}</div>
                    </div>`;
            }).join('');

            const eligibleAccounts = accounts.filter(a => a.type !== 'Tarjeta de Crédito');
            const accountsWithCards = cards.map(c => c.linkedAccount);
            const allAccountsHaveCards = eligibleAccounts.every(a => accountsWithCards.includes(a.id));

            const generateBtn = document.getElementById('generate-card-btn');
            if (generateBtn) generateBtn.style.display = allAccountsHaveCards ? 'none' : 'block';

            document.querySelectorAll('.btn-delete-card').forEach(btn => {
                btn.onclick = () => {
                    Utils.modal.show(
                        'Baja de Tarjeta Virtual',
                        '¿Estás seguro que deseas eliminar esta tarjeta virtual? Se dará de baja inmediatamente.',
                        async () => {
                            const result = await MockServices.CardService.deleteVirtualCard(btn.dataset.cardId);
                            if (result.success) {
                                Utils.showToast(result.message, 'success');
                                this.loadCardsView();
                            }
                        }
                    );
                };
            });

            document.querySelectorAll('.btn-copy-full').forEach(btn => {
                btn.onclick = () => {
                    navigator.clipboard.writeText(btn.dataset.cardNumber.replace(/\s/g, ''));
                    Utils.showToast('Número de tarjeta copiado', 'success');
                };
            });
        }

        const generateBtn = document.getElementById('generate-card-btn');
        if (generateBtn) generateBtn.onclick = () => this.handleGenerateCard();
    },

    async handleGenerateCard() {
        const button = document.getElementById('generate-card-btn');
        const accountId = document.getElementById('card-account-select')?.value;

        if (!accountId) {
            Utils.showToast('Por favor selecciona una cuenta', 'error');
            return;
        }

        Utils.setButtonLoading(button, true);

        try {
            const result = await MockServices.CardService.generateVirtualCard(accountId);
            if (result.success) {
                Utils.showToast('✅ ' + result.message, 'success');
                this.loadCardsView();
            } else {
                Utils.showToast('❌ ' + result.message, 'error');
            }
        } catch (error) {
            Utils.showToast('Error al generar tarjeta', 'error');
        } finally {
            Utils.setButtonLoading(button, false);
        }
    },


    // Real PDF Receipt Generation using jsPDF
    generatePDFReceipt(data) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("COMPROBANTE DE PAGO", 105, 20, { align: "center" });
            doc.setLineWidth(0.5);
            doc.line(20, 25, 190, 25);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`Proveedor: ${data.company}`, 20, 40);
            doc.text(`CUIT: ${data.cuit}`, 20, 48);
            doc.text(`Cliente: ${data.userName}`, 20, 65);
            doc.text(`DNI / CUIT: ${data.userDni}`, 20, 73);
            doc.text(`N° Comprobante: 000${data.id}`, 20, 90);
            doc.text(`Fecha: ${data.date}`, 20, 98);
            doc.text(`Servicio: Pago por servicio de ${data.service}`, 20, 115);
            doc.text(`Período: ${data.period}`, 20, 123);

            doc.line(20, 135, 190, 135);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Importe Total:", 20, 150);
            doc.text(Utils.formatCurrency(data.amount), 190, 150, { align: "right" });

            doc.setFontSize(12);
            doc.text(`Forma de pago: ${data.accountType} (${data.account})`, 20, 165);
            doc.setTextColor(16, 185, 129);
            doc.text("Pago acreditado", 20, 173);
            doc.setTextColor(0, 0, 0);

            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.text("¡Gracias por elegir Home Banking!", 105, 205, { align: "center" });

            doc.save(`Comprobante_Pago_${data.service.replace(/\s+/g, '_')}_${data.id}.pdf`);
            Utils.showToast('Comprobante PDF generado con éxito', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            Utils.showToast('Error al generar el PDF.', 'error');
        }
    },

    updateSidebarProducts() {
        const cards = MockServices.CardService.getVirtualCards();
        const menuItem = document.getElementById('menu-item-virtual-card');
        if (menuItem) {
            const text = menuItem.querySelector('span');
            if (cards.length > 0) {
                menuItem.classList.add('has-product');
                if (text) text.innerHTML = 'Tarjeta Virtual <span class="badge">ACTIVA</span>';
            } else {
                menuItem.classList.remove('has-product');
                if (text) text.textContent = 'Tarjetas Virtuales';
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

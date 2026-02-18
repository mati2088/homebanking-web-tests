const BasePage = require('./BasePage');

class LoginPage extends BasePage {
    constructor(page) {
        super(page);

        // Selectors
        this.usernameInput = 'input[type="text"]';
        this.passwordInput = 'input[type="password"]';
        this.loginButton = 'button[type="submit"]';
        this.errorMessage = '.error-message, .alert-danger';
        this.welcomeMessage = 'h1, .welcome-message';
    }

    async navigateToLogin() {
        await this.navigate('/');
    }

    async login(username, password) {
        await this.fill(this.usernameInput, username);
        await this.fill(this.passwordInput, password);
        await this.click(this.loginButton);
    }

    async getErrorMessage() {
        try {
            await this.waitForSelector(this.errorMessage, { timeout: 3000 });
            return await this.getText(this.errorMessage);
        } catch (error) {
            return null;
        }
    }

    async isLoginSuccessful() {
        try {
            await this.waitForSelector('#user-name', { timeout: 10000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    async getWelcomeMessage() {
        try {
            await this.waitForSelector(this.welcomeMessage, { timeout: 3000 });
            return await this.getText(this.welcomeMessage);
        } catch (error) {
            return null;
        }
    }
}

module.exports = LoginPage;

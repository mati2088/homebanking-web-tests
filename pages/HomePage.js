const BasePage = require('./BasePage');

class HomePage extends BasePage {
    constructor(page) {
        super(page);

        // Selectors
        this.pageTitle = 'h2';
        this.accountSummary = '.account-summary, .panel-principal';
        this.sidebarMenu = '.sidebar, nav';
        this.logoutButton = 'button:has-text("Salir"), a:has-text("Salir")';
    }

    async isHomePageDisplayed() {
        try {
            await this.waitForSelector(this.accountSummary, { timeout: 5000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    async getPageTitle() {
        return await this.getText(this.pageTitle);
    }

    async logout() {
        await this.click(this.logoutButton);
    }
}

module.exports = HomePage;

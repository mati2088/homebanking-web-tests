class BasePage {
    constructor(page) {
        this.page = page;
    }

    async navigate(url) {
        await this.page.goto(url);
    }

    async click(selector) {
        await this.page.click(selector);
    }

    async fill(selector, text) {
        await this.page.fill(selector, text);
    }

    async getText(selector) {
        return await this.page.textContent(selector);
    }

    async isVisible(selector) {
        return await this.page.isVisible(selector);
    }

    async waitForSelector(selector, options = {}) {
        await this.page.waitForSelector(selector, options);
    }

    async waitForURL(url, options = {}) {
        await this.page.waitForURL(url, options);
    }

    async screenshot(path) {
        await this.page.screenshot({ path });
    }
}

module.exports = BasePage;

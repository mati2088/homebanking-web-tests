const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const credentials = require('../testData/credentials');

test.describe('Login Tests @login @test-web', () => {
    let loginPage;
    let homePage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        homePage = new HomePage(page);
        await loginPage.navigateToLogin();
    });

    test('Successful login with valid credentials @smoke @regression', async ({ page }) => {
        // Arrange
        const { username, password } = credentials.validUser;

        // Act
        await loginPage.login(username, password);

        // Assert
        const isLoginSuccessful = await loginPage.isLoginSuccessful();
        expect(isLoginSuccessful).toBeTruthy();

        const isHomePageDisplayed = await homePage.isHomePageDisplayed();
        expect(isHomePageDisplayed).toBeTruthy();
    });

    test('Failed login with invalid credentials @smoke @regression', async ({ page }) => {
        // Arrange
        const username = 'invalid_user';
        const password = 'wrong_password';

        // Act
        await loginPage.login(username, password);

        // Assert
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).not.toBeNull();
    });

    test('Failed login with empty username @regression', async ({ page }) => {
        // Arrange
        const username = '';
        const password = 'password123';

        // Act
        await loginPage.login(username, password);

        // Assert
        const isLoginSuccessful = await loginPage.isLoginSuccessful();
        expect(isLoginSuccessful).toBeFalsy();
    });

    test('Failed login with empty password @regression', async ({ page }) => {
        // Arrange
        const username = 'usuario_demo';
        const password = '';

        // Act
        await loginPage.login(username, password);

        // Assert
        const isLoginSuccessful = await loginPage.isLoginSuccessful();
        expect(isLoginSuccessful).toBeFalsy();
    });

    test('Failed login with empty credentials @regression', async ({ page }) => {
        // Arrange
        const username = '';
        const password = '';

        // Act
        await loginPage.login(username, password);

        // Assert
        const isLoginSuccessful = await loginPage.isLoginSuccessful();
        expect(isLoginSuccessful).toBeFalsy();
    });
});


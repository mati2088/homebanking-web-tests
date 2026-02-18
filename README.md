# Homebanking Automation - Playwright Tests

Proyecto de automatización de pruebas para la aplicación de homebanking demo usando Playwright y el patrón Page Object Model.

## 🚀 Características

- ✅ **Page Object Model (POM)**: Arquitectura escalable y mantenible
- ✅ **Playwright**: Framework moderno de testing end-to-end
- ✅ **Multi-browser**: Soporte para Chrome, Firefox y Safari
- ✅ **Reportes HTML**: Reportes detallados con screenshots y videos
- ✅ **Test Data**: Datos de prueba centralizados y reutilizables

## 📁 Estructura del Proyecto

```
homebankinautomation/
├── pages/                  # Page Object Models
│   ├── BasePage.js        # Clase base con métodos comunes
│   ├── LoginPage.js       # Página de login
│   └── HomePage.js        # Página principal
├── tests/                 # Test specs
│   └── login.spec.js      # Tests de login
├── testData/              # Datos de prueba
│   └── credentials.js     # Credenciales de prueba
├── playwright.config.js   # Configuración de Playwright
└── package.json
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Instalar navegadores de Playwright
npx playwright install
```

## ▶️ Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo UI (interactivo)
npm run test:ui

# Ejecutar tests en un navegador específico
npm run test:chrome
npm run test:firefox
npm run test:webkit

# Ejecutar tests en modo debug
npm run test:debug

# Ver reporte HTML
npm run report
```

## 📝 Tests Implementados

### Login Tests (`tests/login.spec.js`)

1. ✅ Login exitoso con credenciales válidas
2. ✅ Login fallido con credenciales inválidas
3. ✅ Login fallido con usuario vacío
4. ✅ Login fallido con contraseña vacía
5. ✅ Login fallido con credenciales vacías

## 🎯 Page Object Model

### BasePage
Clase base que contiene métodos comunes reutilizables:
- `navigate(url)`: Navegar a una URL
- `click(selector)`: Hacer click en un elemento
- `fill(selector, text)`: Llenar un campo de texto
- `getText(selector)`: Obtener texto de un elemento
- `isVisible(selector)`: Verificar si un elemento es visible
- `waitForSelector(selector)`: Esperar a que un elemento aparezca

### LoginPage
Página de login con métodos específicos:
- `navigateToLogin()`: Navegar a la página de login
- `login(username, password)`: Realizar login
- `getErrorMessage()`: Obtener mensaje de error
- `isLoginSuccessful()`: Verificar si el login fue exitoso

### HomePage
Página principal después del login:
- `isHomePageDisplayed()`: Verificar si la página principal se muestra
- `getPageTitle()`: Obtener el título de la página
- `logout()`: Cerrar sesión

## 🌐 URL de Testing

**URL Base**: https://homebanking-demo-tests.netlify.app/

## 📊 Reportes

Los reportes se generan automáticamente después de cada ejecución:
- **HTML Report**: Reporte interactivo con detalles de cada test
- **Screenshots**: Capturas automáticas en caso de fallo
- **Videos**: Grabaciones de tests fallidos
- **Traces**: Trazas detalladas para debugging

## 🔧 Configuración

La configuración de Playwright se encuentra en `playwright.config.js`:
- Timeout: 30 segundos por test
- Retries: 2 reintentos en CI
- Screenshots: Solo en fallos
- Videos: Solo en fallos
- Traces: En primer reintento

## 📚 Documentación

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

## 👨‍💻 Autor

Proyecto de automatización de pruebas para homebanking demo.

# Homebanking Automation - Playwright Tests

[![Playwright Tests](https://github.com/mati2088/homebanking-web-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/mati2088/homebanking-web-tests/actions/workflows/playwright.yml)

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

### Ejecución General

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

### 🏷️ Ejecución por Tags (CI/CD Ready)

El proyecto soporta ejecución selectiva de tests mediante tags. Ideal para pipelines de CI/CD.

#### Tags Disponibles

| Tag | Descripción | Uso |
|-----|-------------|-----|
| `@smoke` | Tests críticos de humo | Ejecución rápida pre-deploy |
| `@regression` | Suite completa de regresión | Ejecución completa post-deploy |
| `@login` | Tests de autenticación | Tests específicos de login |
| `@test-web` | Tests de aplicación web | Filtrar tests web vs mobile |

#### Comandos por Tag

```bash
# Ejecutar solo tests de smoke (críticos)
npm run test:smoke

# Ejecutar suite completa de regresión
npm run test:regression

# Ejecutar solo tests de login
npm run test:login

# Ejecutar solo tests web
npm run test:web
```

#### Uso Avanzado con --grep

```bash
# Ejecutar tests con múltiples tags (OR)
npx playwright test --grep "@smoke|@login"

# Excluir tests con ciertos tags
npx playwright test --grep-invert "@smoke"

# Combinar tags (tests que tengan ambos)
npx playwright test --grep "(?=.*@smoke)(?=.*@login)"
```

#### Integración CI/CD

**GitHub Actions ejemplo:**
```yaml
- name: Run Smoke Tests
  run: npm run test:smoke

- name: Run Regression Tests
  run: npm run test:regression
```

**Jenkins ejemplo:**
```groovy
stage('Smoke Tests') {
  steps {
    sh 'npm run test:smoke'
  }
}
```


## 📝 Tests Implementados

### Login Tests (`tests/login.spec.js`)

Todos los tests incluyen tags para ejecución selectiva:

| Test | Tags | Descripción |
|------|------|-------------|
| Login exitoso con credenciales válidas | `@smoke @regression @login @test-web` | Test crítico de login exitoso |
| Login fallido con credenciales inválidas | `@smoke @regression @login @test-web` | Validación de credenciales incorrectas |
| Login fallido con usuario vacío | `@regression @login @test-web` | Validación de campo usuario requerido |
| Login fallido con contraseña vacía | `@regression @login @test-web` | Validación de campo password requerido |
| Login fallido con credenciales vacías | `@regression @login @test-web` | Validación de formulario vacío |

**Total**: 5 tests × 3 navegadores = 15 ejecuciones por suite completa


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

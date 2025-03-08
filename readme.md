# 📌 Ejecución de Pruebas en Playwright

## 1️⃣ Ejecutar todas las pruebas del flujo de carga

```bash
npx playwright test --grep "@carga"
```

#### ✅ Esto ejecutará todos los tests que tienen @carga en su descripción.


## 2️⃣ Ejecutar specs individuales
## Si solo quieres ejecutar MeterValues, pero sin validar si se hizo BootNotification antes:
```bash
npx playwright test tests/meterValues.spec.js
```
#### ⚠️ Esto fallará si no has corrido StartTransaction antes, pero al usar stateManager, puedes verificarlo.


#### ✅ **Este Markdown es ideal para documentación en tu repositorio.** 🚀
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


Aquí tienes una explicación detallada de cómo funcionan las llamadas a API en tu framework utilizando dos fuentes de datos JSON:

──────────────────────────────────────────────

Fuentes de configuración JSON
────────────────────────────────────────────── • Los archivos que se encuentran en
 d:\Development\DHEMAX\Automation Playwright\ocpp-framework_v3\data\
son la base para configurar las peticiones API.
 – Por un lado, tienes el archivo genericRequestConfig.json.
  Este archivo se usa principalmente para peticiones genéricas (por ejemplo, el login), en el cual defines todos los parámetros necesarios:    • endpoint, method, headers, params, body y timeout.
   • Además, incluye la propiedad requiresToken, que indica si se debe inyectar el token en el header "Authorization".
   • El token se obtiene de la respuesta del login o se configura en el JSON (o a través de process.env.API_TOKEN) y se extrae para usarse en llamadas posteriores.
 – Por otro lado, tienes la carpeta data/api con archivos específicos para el CRUD (postResourceConfig.json, putResourceConfig.json, getResourceConfig.json y deleteResourceConfig.json).
  Cada uno de estos JSON define la configuración para cada operación:    • En el POST se define el body del nuevo recurso, en el PUT se indica qué datos actualizar, en el GET se configura la consulta, y en el DELETE se define el recurso a eliminar.    • Cada uno puede tener su propia configuración de headers, parámetros, timeout y validación esperada (expectedResponse y validationRules).
────────────────────────────────────────────── 2. Funcionamiento interno de las API
────────────────────────────────────────────── • El módulo genericClient.js (ubicado en la carpeta api) se encarga de interpretar el JSON que se le pasa y construir la solicitud HTTP utilizando axios.
 – Se validan que la configuración incluya el endpoint y el método.
 – Si la propiedad requiresToken es true, se inyecta en el header "Authorization" el token que se obtiene del login o definido en el JSON/configuración de entorno.
 – Una vez definida la petición (método, URL, headers, parámetros y body), se envía la petición mediante axios.
• Al recibir la respuesta, se valida:  – Primero se compara el status HTTP con lo indicado en expectedResponse.status.  – Luego, se buscan las propiedades esperadas en el objeto de respuesta (expectedResponse.body) y se aplican reglas generales definidas en validationRules (por ejemplo, usando una ruta JSON simple para comparar valores con un operador “equals”).  – El objeto final retornado es una combinación de la respuesta de axios y el resultado de la validación, permitiendo que los tests verifiquen si la respuesta es válida.

────────────────────────────────────────────── 3. Escenarios y flujo de autenticación
────────────────────────────────────────────── • Cuando ejecutas el escenario de login (flow de API por ejemplo en apiFlow.spec.js):  – Se carga la configuración del login desde genericRequestConfig.json.  – Se envía la petición de login (usualmente un POST) y se espera que en la respuesta se incluya el token.  – Ese token se guarda (por ejemplo, en una variable authToken o stateManager) para ser inyectado en los headers de las posteriores solicitudes que requieren autenticación. • En los escenarios CRUD (POST, PUT, GET, DELETE):  – Se carga la configuración desde los respectivos archivos JSON de la carpeta data/api.
 – Si el JSON indica requiresToken true, el framework inyecta automáticamente el header "Authorization" con el token obtenido del login.  – De esta forma, puedes ejecutar peticiones en cascada: primero loguearte, luego crear un recurso (POST), actualizarlo (PUT), consultarlo (GET) y finalmente eliminarlo (DELETE).

────────────────────────────────────────────── 4. Resumen
────────────────────────────────────────────── • El framework usa dos fuentes JSON:  - Generic: para peticiones generales (ej. login) y escenarios donde se inyecta token; definido en genericRequestConfig.json.  - CRUD: separamos las configuraciones para cada operación en la carpeta data/api. • El módulo genericClient.js utiliza axios para enviar la petición y valida la respuesta de acuerdo a la configuración definida. • En el flujo de autenticación, mediante el login se extrae el token y se guarda. Luego, todas las peticiones que requieren autenticación lo usan inyectándolo en el header "Authorization". • Esto permite crear escenarios en cascada donde, a partir del login, se ejecuten secuencias de peticiones (POST, PUT, GET, DELETE) para simular procesos completos de integración de API.

Con este enfoque, tienes una arquitectura flexible en la que los JSON de configuración definen de forma declarativa cómo se deben ejecutar y validar las peticiones API, permitiendo tanto la ejecución de flujos CRUD como el uso de peticiones genéricas.

666
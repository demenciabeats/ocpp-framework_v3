import axios from 'axios';

/**
 * Función para validar la respuesta usando datos esperados y reglas definidas.
 * @param {Object} response - Respuesta obtenida de axios.
 * @param {Object} expected - Objeto con los valores esperados (por ejemplo, status, body).
 * @param {Object} rules - Reglas de validación con formato JSON.
 * @returns {Object} Objeto con { valid: boolean, errors: string[] }
 */
function validateResponse(response, expected = {}, rules = {}) {
  const errors = [];

  // Validar código de estado si se define.
  if (expected.status && response.status !== expected.status) {
    errors.push(`Se esperaba status ${expected.status} y se recibió ${response.status}`);
  }

  // Validar propiedades del body esperado.
  if (expected.body) {
    for (const key in expected.body) {
      if (response.data[key] !== expected.body[key]) {
        errors.push(`La propiedad '${key}' esperaba ${expected.body[key]} y se recibió ${response.data[key]}`);
      }
    }
  }

  // Validar reglas personalizadas.
  if (rules.rules && Array.isArray(rules.rules)) {
    rules.rules.forEach(rule => {
      // Asumimos formato: { "jsonPath": "$.data.value", "operator": "equals", "expected": 123 }
      const parts = rule.jsonPath.split('.');
      if (parts[0] === '$') parts.shift();
      let value = response.data;
      for (const part of parts) {
        value = value ? value[part] : undefined;
      }
      if (rule.operator === 'equals') {
        if (value !== rule.expected) {
          errors.push(`Fallo en la validación en ${rule.jsonPath}: se esperaba ${rule.expected} y se recibió ${value}`);
        }
      }
      // Otros operadores pueden implementarse aquí.
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Envía una petición genérica de acuerdo con la configuración especificada.
 * La configuración se espera con la siguiente estructura:
 * {
 *   "endpoint": "http://ejemplo.com/api",
 *   "method": "POST",
 *   "headers": { "Content-Type": "application/json" },
 *   "params": { ... },
 *   "auth": { "username": "user", "password": "pass" },
 *   "body": { ... },
 *   "timeout": 10000,
 *   "expectedResponse": {
 *         "status": 200,
 *         "body": { "result": "ok" }
 *   },
 *   "validationRules": {
 *         "rules": [
 *             { "jsonPath": "$.data.value", "operator": "equals", "expected": 123 }
 *         ]
 *   },
 *   "requiresToken": true,  // para indicar que se inyecte el header "Authorization"
 *   "token": "Bearer <token>"  // o se puede obtener de forma global.
 * }
 * @param {Object} config - Objeto de configuración en JSON.
 * @returns {Promise<Object>} Objeto con la respuesta de axios y los resultados de la validación.
*/
export async function sendGenericRequest(config) {
  if (!config.endpoint) throw new Error("La configuración debe incluir 'endpoint'.");
  if (!config.method) throw new Error("La configuración debe incluir 'method'.");

  // Construir headers; si ya existen, se preservan
  const headers = config.headers || {};

  // Si la configuración requiere token y no se encuentra en headers,
  // revisamos si se entrega la propiedad token
  if (config.requiresToken) {
    if (config.token) {
      headers["Authorization"] = config.token;
    } else {
      // También podrías obtener el token desde una variable de entorno u otro servicio
      headers["Authorization"] = `Bearer ${process.env.API_TOKEN || ''}`;
    }
  }

  const requestOptions = {
    method: config.method,
    url: config.endpoint,
    headers,
    params: config.params || {},
    data: config.body || {},
    timeout: config.timeout || 10000 // valor por defecto de 10 segundos
  };

  // Si se proporciona autenticación básica y no se sobreescribió el token, agrégala.
  if (config.auth && !config.requiresToken) {
    requestOptions.auth = config.auth;
  }

  let response;
  try {
    response = await axios(requestOptions);
  } catch (err) {
    if (err.response) {
      response = err.response;
    } else {
      throw err;
    }
  }

  const expected = config.expectedResponse || {};
  const rules = config.validationRules || {};
  const validationResult = validateResponse(response, expected, rules);

  return {
    response,
    validation: validationResult
  };
}
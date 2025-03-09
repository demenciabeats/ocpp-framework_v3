import axios from 'axios';

// Función que valida la respuesta conforme a los valores esperados y reglas definidas
function validateResponse(response, expected = {}, rules = {}) {
    const errors = [];
    
    // Validar código de estado HTTP
    if (expected.status && response.status !== expected.status) {
        errors.push(`Se esperaba status ${expected.status} y se recibió ${response.status}`);
    }
    
    // Validar propiedades del cuerpo esperado
    if (expected.body) {
        for (const key in expected.body) {
            if (response.data[key] !== expected.body[key]) {
                errors.push(`La propiedad '${key}' esperaba ${expected.body[key]} y se recibió ${response.data[key]}`);
            }
        }
    }
    
    // Validar reglas personalizadas
    if (rules.rules && Array.isArray(rules.rules)) {
        rules.rules.forEach(rule => {
            // Ejemplo: { "jsonPath": "$.data.value", "operator": "equals", "expected": 123 }
            const parts = rule.jsonPath.split('.');
            if (parts[0] === '$') parts.shift();
            let value = response.data;
            for (const part of parts) {
                value = value ? value[part] : undefined;
            }
            if (rule.operator === 'equals' && value !== rule.expected) {
                errors.push(`Fallo en la validación en ${rule.jsonPath}: se esperaba ${rule.expected} y se recibió ${value}`);
            }
            // Se pueden agregar otros operadores según necesites
        });
    }
    
    return { valid: errors.length === 0, errors };
}

/**
 * Envía una petición genérica según la configuración especificada.
 * La configuración JSON debe incluir:
 * - endpoint: URL del servicio.
 * - method: Método HTTP (GET, POST, PUT, DELETE, etc).
 * - headers, params, body, timeout, expectedResponse, validationRules.
 * - requiresToken: Si se requiere inyectar el header "Authorization".
 * - token: Token a usar si está definido.
 *
 * @param {Object} config Configuración en formato JSON.
 * @returns {Promise<Object>} Objeto con la respuesta de axios y resultados de la validación.
 */
export async function sendGenericRequest(config) {
    if (!config.endpoint) throw new Error("La configuración debe incluir 'endpoint'.");
    if (!config.method) throw new Error("La configuración debe incluir 'method'.");

    // Construir headers; si ya existen se preservan
    const headers = config.headers || {};

    // Si se requiere token, inyectarlo en el header "Authorization"
    if (config.requiresToken) {
        headers["Authorization"] = config.token ? config.token : `Bearer ${process.env.API_TOKEN || ''}`;
    }

    const requestOptions = {
        method: config.method,
        url: config.endpoint,
        headers,
        params: config.params || {},
        data: config.body || {},
        timeout: config.timeout || 10000 // 10 segundos por defecto
    };

    // Agregar autenticación básica si se proporcione y no se requiere token
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

    return { response, validation: validationResult };
}
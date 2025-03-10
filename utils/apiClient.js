import { request } from '@playwright/test';
import { setToken, getToken } from './authManager';

/**
 * Realiza una solicitud HTTP genérica.
 * @param {Object} config - Configuración de la API.
 * @returns {Object} - Respuesta de la API.
 */
async function apiRequest(config) {
    const { method, url, headers = {}, body = null, requiresAuth = false, extractToken = false, tokenPath = "token" } = config;
    
    const context = await request.newContext();
    try {
        // Si requiere autenticación, agregar el token almacenado
        if (requiresAuth) {
            const token = getToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            } else {
                throw new Error("No hay token almacenado. ¿Olvidaste hacer login?");
            }
        }

        // Asegura que se envíe JSON correctamente
        const finalHeaders = {
            "Content-Type": "application/json",
            ...headers
        };

        // Envía el cuerpo transformado a JSON (usando JSON.stringify siempre)
        const requestBody = body ? JSON.stringify(body) : undefined;
        
        // Registros para depurar
        console.log("Request URL:", url);
        console.log("Request Method:", method);
        console.log("Request Headers:", finalHeaders);
        console.log("Request Body:", requestBody);
        
        const response = await context.fetch(url, {
            method,
            headers: finalHeaders,
            body: requestBody,
            timeout: 15000 // Agregamos timeout de 15 segundos
        });

        const responseBody = await response.json().catch(() => null);

        // Si es una API de login y extrae un token, lo guardamos
        if (extractToken && response.status() === 200) {
            const token = responseBody[tokenPath];
            if (token) {
                setToken(token);
                console.log("Token guardado:", token);
            } else {
                throw new Error(`No se encontró el token en la ruta ${tokenPath}`);
            }
        }

        return {
            status: response.status(),
            body: responseBody
        };
    } finally {
        await context.dispose(); // Cerrar el contexto para liberar recursos
    }
}

export default apiRequest;

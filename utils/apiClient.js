import { request } from '@playwright/test';
import { setToken, getToken } from './authManager';

async function apiRequest(config) {
    const { method, url, headers = {}, body = null, requiresAuth = false, extractToken = false, tokenPath = "token" } = config;
    
    const context = await request.newContext();
    try {
        if (requiresAuth) {
            const token = getToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            } else {
                throw new Error("No hay token almacenado. ¿Olvidaste hacer login?");
            }
        }

        const finalHeaders = {
            "Content-Type": "application/json",
            ...headers
        };

        const requestBody = body ? JSON.stringify(body) : undefined;
        
        console.log("Request URL:", url);
        console.log("Request Method:", method);
        console.log("Request Headers:", finalHeaders);
        console.log("Request Body:", requestBody);
        
        const response = await context.fetch(url, {
            method,
            headers: finalHeaders,
            body: requestBody,
            timeout: 15000
        });

        const responseBody = await response.json().catch(() => null);

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
        await context.dispose();
    }
}

export default apiRequest;

import { test, expect } from '@playwright/test';
import apiConfig from '../../api/apiConfig';

test.describe('API Tests', () => {

    test('Login y almacenamiento de token', async ({ request }) => {
        const response = await request.post(apiConfig.login.url, {
            headers: apiConfig.login.defaultHeaders,
            data: apiConfig.login.body,
            timeout: 15000
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        console.log(responseBody);
        expect(responseBody).toHaveProperty(apiConfig.login.tokenPath);
    });

    test('API protegida con token almacenado', async ({ request }) => {
        // Realiza login para obtener el token
        const loginResponse = await request.post(apiConfig.login.url, {
            headers: apiConfig.login.defaultHeaders,
            data: apiConfig.login.body,
            timeout: 15000
        });
        expect(loginResponse.status()).toBe(200);
        const loginBody = await loginResponse.json();
        const token = loginBody[apiConfig.login.tokenPath];
        // Llama a la API protegida agregando dinámicamente el encabezado Authorization
        const response = await request.get(apiConfig.api1.url, {
            headers: {
                ...apiConfig.api1.defaultHeaders,
                Authorization: `Bearer ${token}`
            },
            timeout: 15000
        });
        
        expect(response.status()).toBe(apiConfig.api1.expectedResponse.status);
    });
/*
    test('API pública sin autenticación', async ({ request }) => {
        const response = await request.get(apiConfig.api2.url, {
            headers: apiConfig.api2.defaultHeaders,
            timeout: 15000
        });
        expect(response.status()).toBe(apiConfig.api2.expectedResponse.status);
    });
*/
});

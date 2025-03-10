import { test, expect } from '@playwright/test';
import apiConfig from '../../api/apiConfig';

test.describe('API Tests', () => {

    let token = '';

    test.beforeAll(async ({ request }) => {
        // Login para obtener el token antes de ejecutar las pruebas
        const loginResponse = await request.post(apiConfig.login.url, {
            headers: apiConfig.login.defaultHeaders,
            data: apiConfig.login.body,
            timeout: 15000
        });
        expect(loginResponse.status()).toBe(200);
        const loginBody = await loginResponse.json();
        token = loginBody[apiConfig.login.tokenPath];
    });

    test('Validar código de estado HTTP', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000
        });
        expect(response.status()).toBe(200);
    });

    test('Validar estructura de la respuesta', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const responseBody = await response.json();
        expect(Object.keys(responseBody)).toEqual(expect.arrayContaining(["id", "name", "email"]));
    });

    test('Validar propiedad específica en la respuesta', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty("user.id");
    });

    test('Validar tipo de datos en la respuesta', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonData = await response.json();
        expect(typeof jsonData.id).toBe("number");
        expect(typeof jsonData.name).toBe("string");
    });

    test('Validar longitud de un campo', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonData = await response.json();
        expect(jsonData.name.length).toBeGreaterThan(2);
    });

    test('Validar valores específicos dentro de un array', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonData = await response.json();
        expect(jsonData.roles).toContain("admin");
    });

    test('Validar formato de fecha', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonData = await response.json();
        expect(jsonData.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    test('Validar que una fecha es menor que otra', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonData = await response.json();
        expect(new Date(jsonData.createdAt)).toBeLessThan(new Date(jsonData.updatedAt));
    });

    test('Validar encabezados de la respuesta', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(response.headers()["content-type"]).toContain("application/json");
    });

    test('Validar respuesta en menos de 500ms', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(response.timing().responseEnd - response.timing().requestStart).toBeLessThan(500);
    });

    test('Comparar respuesta con JSON externo', async ({ request }) => {
        const expectedData = require('../../data/expectedResponse.json');
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(await response.json()).toEqual(expectedData);
    });

    test('Validar que un objeto específico existe en un array', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonData = await response.json();
        expect(jsonData.items).toEqual(expect.arrayContaining([{ id: 123, name: "Producto A" }]));
    });

    test('Validar token JWT válido', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonData = await response.json();
        expect(jsonData.token.split(".").length).toBe(3);
    });

    test('Validar que una API devuelve datos paginados correctamente', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonData = await response.json();
        expect(jsonData.items.length).toBe(10);
        expect(jsonData.currentPage).toBe(1);
    });

    test('Validar que un campo no cambió después de actualizar', async ({ request }) => {
        const before = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await request.put(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` },
            data: { email: "nuevo@email.com" }
        });
        const after = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect((await before.json()).id).toBe((await after.json()).id);
    });

    test('Validar que la respuesta no contiene datos sensibles', async ({ request }) => {
        const response = await request.get(apiConfig.api1.url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonData = await response.json();
        expect(jsonData).not.toHaveProperty("password");
    });

});

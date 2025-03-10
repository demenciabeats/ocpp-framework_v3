import { test, expect } from '@playwright/test';
import apiConfig from '../../api/apiConfig';

test.describe('API Tests', () => {

    test('Login y almacenamiento de token', async ({ request }) => {
        const response = await request.post(apiConfig.login.url, {
            headers: apiConfig.login.headers,
            data: apiConfig.login.body,
            timeout: 15000
        });
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        console.log(responseBody);
        expect(responseBody).toHaveProperty(apiConfig.login.tokenPath);
    });

    // ...otros tests...
});

import { test, expect } from '@playwright/test';
import apiConfig from '../../api/apiConfig';

test.describe('API Tests', () => {
    test('API pública sin autenticación', async ({ request }) => {
        console.log("Request URL:", apiConfig.unlock.url);
        console.log("Request Headers:", apiConfig.unlock.defaultHeaders);
        const response = await request.post(apiConfig.unlock.url, {
            headers: apiConfig.unlock.defaultHeaders,
            timeout: 15000,
        });
        console.log("APIResponse:", await response.text());
        expect(response.status()).toBe(apiConfig.unlock.expectedResponse.status);
    });
});

import { test, expect } from '@playwright/test';
import apiConfig from '../../api/apiConfig';

test.describe('API Tests', () => {
   
    test('API pública sin autenticación', async ({ request }) => {
        const response = await request.get(apiConfig.api2.url, {
            headers: apiConfig.api2.defaultHeaders,
            timeout: 15000
        });
        expect(response.status()).toBe(apiConfig.api2.expectedResponse.status);
    });

});

import { test } from '../../fixtures/apiFixture';
import getConfig from '../../data/api/getResourceConfig.json' assert { type: 'json' };

test('GET - Validar que la API responda y retorne data', async ({ apiClient }) => {
  await test.step('Enviar petición GET', async () => {
    const { response } = await apiClient.sendGenericAPIRequest(getConfig);
    console.log('Respuesta GET:', response.data);
  
    test.expect(response).toBeDefined();
    test.expect(response.data).toBeDefined();
    test.expect(Array.isArray(response.data)).toBe(true);
    test.expect(response.data.length).toBeGreaterThan(0);
    test.expect(response.data[0].id).toBeDefined();
    test.expect(response.data[0].id).not.toEqual('');
  });
});
import { test } from '../fixtures/apiFixture';
import genericConfig from '../data/genericRequestConfig.json' assert { type: 'json' };

test('Validar que la API responda y retorne data', async ({ apiClient }) => {
  await test.step('Enviar petición genérica a la API', async () => {
    const { response } = await apiClient.sendGenericAPIRequest(genericConfig);
    console.log('Respuesta:', response.data);
    
    test.expect(response).toBeDefined();
    test.expect(response.data).toBeDefined();
    test.expect(Array.isArray(response.data)).toBe(true);
    test.expect(response.data.length).toBeGreaterThan(0);
    
    test.expect(response.data[0].id).toBeDefined();
    test.expect(response.data[0].id).not.toEqual('');
  });
});
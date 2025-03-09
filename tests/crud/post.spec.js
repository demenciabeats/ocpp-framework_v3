import { test } from '../../fixtures/apiFixture';
import postConfig from '../../data/api/postResourceConfig.json' assert { type: 'json' };

test('POST - Validar creacion de recurso mediante API', async ({ apiClient }) => {
  await test.step('Enviar petición POST', async () => {
    const { response, validation } = await apiClient.sendGenericAPIRequest(postConfig);
    console.log('Respuesta POST:', response.data);
    
    test.expect(response).toBeDefined();
    test.expect(response.data).toBeDefined();
    test.expect(response.data.email).toBe(postConfig.body.email);
  });
});
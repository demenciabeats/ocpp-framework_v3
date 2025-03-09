import { test } from '../../fixtures/apiFixture';
import putConfig from '../../data/api/putResourceConfig.json' assert { type: 'json' };

test('PUT - Validar actualizacion de recurso mediante API', async ({ apiClient }) => {
  await test.step('Enviar petición PUT', async () => {
    const { response, validation } = await apiClient.sendGenericAPIRequest(putConfig);
    console.log('Respuesta PUT:', response.data);
    
    test.expect(response).toBeDefined();
    test.expect(response.data).toBeDefined();
    test.expect(response.data.username).toBe(putConfig.body.username);
  });
});
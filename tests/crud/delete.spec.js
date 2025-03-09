import { test } from '../../fixtures/apiFixture';
import deleteConfig from '../../data/api/deleteResourceConfig.json' assert { type: 'json' };

test('DELETE - Validar eliminacion de recurso mediante API', async ({ apiClient }) => {
  await test.step('Enviar petición DELETE', async () => {
    const { response } = await apiClient.sendGenericAPIRequest(deleteConfig);
    console.log('Respuesta DELETE:', response.data);
    
    test.expect(response).toBeDefined();
    // Agrega validaciones adicionales según la respuesta
  });
});
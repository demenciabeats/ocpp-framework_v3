import { test } from '../fixtures/apiFixture';
import genericConfig from '../data/genericRequestConfig.json' assert { type: 'json' };

test('Validar que la API responda y retorne data', async ({ apiClient }) => {
  const { response } = await apiClient.sendGenericAPIRequest(genericConfig);
  console.log('Respuesta:', response.data);
  
  // Valida que se reciba respuesta (data no nulo y contenido) y que sea un arreglo
  test.expect(response).toBeDefined();
  test.expect(response.data).toBeDefined();
  test.expect(Array.isArray(response.data)).toBe(true);
  test.expect(response.data.length).toBeGreaterThan(0);
  
  // Validar que el primer elemento tenga definida la propiedad "id"
  test.expect(response.data[0].id).toBeDefined();
  test.expect(response.data[0].id).not.toEqual('');
});
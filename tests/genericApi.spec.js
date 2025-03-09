import { test, expect } from '@playwright/test';
import ApiClient from '../api/apiClient';
import genericConfig from '../data/genericRequestConfig.json' assert { type: 'json' };

test('Validar que la API responda y retorne data', async () => {
  const apiClient = new ApiClient(); 
  const response = await apiClient.sendGenericAPIRequest(genericConfig);
  console.log(response.response.data);
  test.expect(response.response).toBeDefined();
  // En este caso, el endpoint retorna un objeto con token y mensaje
  test.expect(typeof response.response.data).toBe('object');
  // Validar que existen propiedades clave en la respuesta (por ejemplo, access_token y message)
  test.expect(response.response.data.access_token).toBeDefined();
  test.expect(response.response.data.message).toBe('Login Successful');
});
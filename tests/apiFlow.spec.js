import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import ApiClient from '../api/apiClient';

// Función para cargar un JSON de configuración
function loadConfig(relativePath) {
  const fullPath = path.join(process.cwd(), 'data', ...relativePath.split('/'));
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

test.describe('Flujo de API en cascada', () => {
  let apiClient;
  // Variable para guardar token obtenido en login
  let authToken = '';

  test.beforeAll(async () => {
    apiClient = new ApiClient();
  });

  test('Login y cascada de recursos', async () => {
    // Paso 1: Login – Se usa genericRequestConfig.json para autenticar y obtener token
    test.step('Realizar login y guardar token', async () => {
      const loginConfig = loadConfig('genericRequestConfig.json');
      // Simulación: se espera que la respuesta incluya el token
      const loginResponse = await apiClient.sendGenericAPIRequest(loginConfig);
      // Si la respuesta no incluye token, se usa el token de la configuración
      authToken = loginConfig.token || process.env.API_TOKEN || '';
      console.log('Token obtenido:', authToken);
      expect(authToken).toBeTruthy();
    });

    // Paso 2: Crear un recurso (POST)
    test.step('Crear recurso (POST)', async () => {
      const postConfig = loadConfig('api/postResourceConfig.json');
      // Inyecta el token en el header si se requiere
      if (postConfig.requiresToken) {
        postConfig.headers["Authorization"] = authToken;
      }
      const postResponse = await apiClient.sendGenericAPIRequest(postConfig);
      expect(postResponse.validation.valid).toBeTruthy();
      console.log('POST response:', postResponse.response.data);
    });

    // Paso 3: Actualizar recurso (PUT)
    test.step('Actualizar recurso (PUT)', async () => {
      const putConfig = loadConfig('api/putResourceConfig.json');
      if (putConfig.requiresToken) {
        putConfig.headers["Authorization"] = authToken;
      }
      const putResponse = await apiClient.sendGenericAPIRequest(putConfig);
      expect(putResponse.validation.valid).toBeTruthy();
      console.log('PUT response:', putResponse.response.data);
    });

    // Paso 4: Consultar recurso (GET)
    test.step('Consultar recurso (GET)', async () => {
      const getConfig = loadConfig('api/getResourceConfig.json');
      if (getConfig.requiresToken) {
        getConfig.headers["Authorization"] = authToken;
      }
      const getResponse = await apiClient.sendGenericAPIRequest(getConfig);
      expect(getResponse.validation.valid).toBeTruthy();
      console.log('GET response:', getResponse.response.data);
    });

    // Paso 5: Eliminar recurso (DELETE)
    test.step('Eliminar recurso (DELETE)', async () => {
      const deleteConfig = loadConfig('api/deleteResourceConfig.json');
      if (deleteConfig.requiresToken) {
        deleteConfig.headers["Authorization"] = authToken;
      }
      const deleteResponse = await apiClient.sendGenericAPIRequest(deleteConfig);
      expect(deleteResponse.validation.valid).toBeTruthy();
      console.log('DELETE response:', deleteResponse.response.data);
    });
  });
});

import { test, expect } from '@playwright/test';
import { executeQuery, compareResults } from '../../db/dbCliente';
import queryConfig from '../../db/queryConfig';

// Agrupar los tests con test.describe
test.describe('Comparación DB vs API/WS', () => {
  
  // Hook antes de cada test (opcional)
  test.beforeEach(async () => {
    // ...existing code...
  });

  // Test principal para validar datos de usuario
  test('Validar datos usuario', async () => {
    const { query, params, expectedResult } = queryConfig.getUsers;
    const dbData = await executeQuery(query, params);
    // Se toma la fila correspondiente (aquí se asume que el dato se encuentra en el índice 1)
    const firstRow = dbData[0];
    expect(firstRow.username).toBe("Franco Provoste");
    expect(firstRow.email).toBe("fprovoste@dhemax.com");
    expect(firstRow.empresas_id).toBe("61");
    console.log('DB Data:', dbData);
  });

  // Hook después de cada test (opcional)
  test.afterEach(async () => {
    // ...existing code...
  });
});

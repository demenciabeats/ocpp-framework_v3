import { test, expect } from '@playwright/test';
import { executeQuery, compareResults } from '../../db/dbCliente';
import queryConfig from '../../db/queryConfig';

test.describe('Comparación DB vs API/WS', () => {
  

  test.beforeEach(async () => {
  });

  test('Validar datos usuario', async () => {
    const { query, params, expectedResult } = queryConfig.getUsers;
    const dbData = await executeQuery(query, params);
    const firstRow = dbData[0];
    expect(firstRow.username).toBe("Franco Provoste");
    expect(firstRow.email).toBe("fprovoste@dhemax.com");
    expect(firstRow.empresas_id).toBe("61");
    console.log('DB Data:', dbData);
  });


  test.afterEach(async () => {
  });
});

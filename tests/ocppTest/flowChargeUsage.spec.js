import { test } from '../../fixtures/ocppFixture';
import testData from '../../data/testData';
import { flowCharge } from '../../utils/testHelpers';

// Aumentar explícitamente el timeout para este archivo de prueba
test.setTimeout(600000);

test.describe.serial('Flujo completo flowCharge', () => {
  test('Enviar flowCharge', async ({ ocppClient }) => {
    // Extraer el idTag desde el objeto "authorize" del testData y renombrarlo
    const { authorize: authDataObj, startTransaction: startData, statusData, connector } = testData;
    const authIdTag = authDataObj.idTag;

    await flowCharge(ocppClient, authIdTag, startData, statusData, connector);
  });
});

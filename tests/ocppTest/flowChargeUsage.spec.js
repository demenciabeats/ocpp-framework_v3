import { test } from '../../fixtures/ocppFixture';
import testData from '../../data/testData';
import { flowCharge } from '../../utils/testHelpers';

test.setTimeout(600000);

test.describe.serial('Flujo completo flowCharge', () => {
  test('Enviar flowCharge', async ({ ocppClient }) => {
    const { authorize: authDataObj, startTransaction: startData, statusData, connector } = testData;
    const authIdTag = authDataObj.idTag;

    await flowCharge(ocppClient, authIdTag, startData, statusData, connector);
  });
});

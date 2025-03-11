import { test, expect } from '@playwright/test';
import OcppClient from '../../api/ocppClient';
import { flowCharge } from '../../utils/testHelpers';
import testData from '../../data/testData';

test('Flujo completo flowCharge', async () => {
  // Extraer el idTag desde el objeto "authorize" del testData y renombrarlo
  const { authorize: authDataObj, startTransaction: startData, statusData, connector } = testData;
  const authIdTag = authDataObj.idTag;
  
  const wsUrl = process.env.WS_URL;
  const chargePointId = process.env.CHARGE_POINT_ID;
  const ocppClient = new OcppClient(wsUrl, chargePointId);
  await ocppClient.connect();

  // Pasar authIdTag en lugar de authData
  await flowCharge(ocppClient, authIdTag, startData, statusData, connector);
  ocppClient.close();
});

import { test } from '../fixtures/ocppFixture';
import stateManager from '../utils/stateManager';
import testData from '../data/testData';
import { bootNotification, authorize, startTransaction } from '../utils/testHelpers';

test.describe.serial('@carga StartTransaction', () => {
  test('Enviar StartTransaction', async ({ ocppClient }) => {
    if (!stateManager.state.bootNotificationSent) {
      const bootRes = await bootNotification(ocppClient, testData.bootNotification);
      console.log('<= Respuesta BootNotification:', bootRes);
      stateManager.saveState({ bootNotificationSent: true });
    }

    if (!stateManager.state.authorized) {
      const authRes = await authorize(ocppClient, testData.authorize.idTag);
      console.log('<= Respuesta Authorize:', authRes);
      stateManager.saveState({ authorized: true });
    }

    const startRes = await startTransaction(ocppClient, testData.startTransaction);
    console.log('<= Respuesta StartTransaction:', startRes);

    if (startRes?.idTagInfo?.status === "Accepted") {
      stateManager.saveState({ transactionId: startRes.transactionId });
      console.log(`🤝 StartTransaction aceptado. transactionId real: ${startRes.transactionId}`);
    } else {
      throw new Error(`StartTransaction rechazado o inválido: ${JSON.stringify(startRes)}`);
    }
  });
});
import { test } from '../fixtures/ocppFixture';
import stateManager from '../utils/stateManager';
import testData from '../data/testData';
import { bootNotification, authorize, startTransaction, heartbeat } from '../utils/testHelpers';

test.describe.serial('@carga Heartbeat', () => {
  test('Enviar Heartbeat', async ({ ocppClient }) => {
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

    if (!stateManager.state.transactionId) {
      const startRes = await startTransaction(ocppClient, testData.startTransaction);
      console.log('<= Respuesta StartTransaction:', startRes);

      if (startRes?.idTagInfo?.status === "Accepted") {
        stateManager.saveState({ transactionId: startRes.transactionId });
        console.log(`🤝 StartTransaction aceptado. transactionId real: ${startRes.transactionId}`);
      } else {
        throw new Error(`StartTransaction rechazado o inválido: ${JSON.stringify(startRes)}`);
      }
    }

    // Enviar Heartbeat después de 1 minuto de carga
    setTimeout(async () => {
      console.log('🩺 Enviando Heartbeat...');
      const heartbeatRes = await heartbeat(ocppClient);
      console.log('<= Respuesta Heartbeat:', heartbeatRes);
    }, 60000); // 1 minuto
  });
});
import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import testData from '../../data/testData';
import { bootNotification, authorize, startTransaction, stopTransaction } from '../../utils/testHelpers';

test.describe.serial('@carga StopTransaction', () => {
  test('Enviar StopTransaction', async ({ ocppClient }) => {
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

    const txId = stateManager.state.transactionId;
    if (!txId) {
      throw new Error('🚨 No hay transactionId para enviar StopTransaction.');
    }

    // Enviar StopTransaction después de 1:30 minutos de carga
    setTimeout(async () => {
      console.log('🛑 Enviando StopTransaction...');
      const stopRes = await stopTransaction(ocppClient, {
        transactionId: txId,
        meterStop: testData.stopTransaction.meterStop,
        timestamp: testData.stopTransaction.timestamp
      });
      console.log('<= Respuesta StopTransaction:', stopRes);
    }, 90000); // 1:30 minutos
  });
});
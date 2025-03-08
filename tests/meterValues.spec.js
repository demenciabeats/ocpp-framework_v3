import { test } from '../fixtures/ocppFixture';
import stateManager from '../utils/stateManager';
import testData from '../data/testData';
import { bootNotification, authorize, startTransaction, statusNotification, simulateCharging } from '../utils/testHelpers';

test.describe.serial('@carga MeterValues', () => {
  test('Enviar MeterValues', async ({ ocppClient }) => {
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
      throw new Error('🚨 No hay transactionId para enviar MeterValues.');
    }

    // Enviar StatusNotification con estado Charging
    console.log('⚡ Enviando StatusNotification (Charging)...');
    const statusRes = await statusNotification(ocppClient, {
      connectorId: testData.startTransaction.connectorId,
      status: "Charging",
      errorCode: "NoError"
    });
    console.log('<= Respuesta StatusNotification:', statusRes);

    const { intervalSeconds, durationSeconds } = testData.meterValuesConfig;
    const connector = testData.connector;

    // Iniciar el envío de MeterValues
    await simulateCharging(ocppClient, txId, intervalSeconds, durationSeconds, connector);

    // Esperar a que se generen todos los MeterValues antes de cerrar la conexión
    await new Promise(resolve => setTimeout(resolve, durationSeconds * 1000));
  });
});
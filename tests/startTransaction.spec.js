import { test } from '../fixtures/ocppFixture';
import stateManager from '../utils/stateManager';
import testData from '../data/testData';
import { bootNotification, authorize, startTransaction, stopTransaction } from '../utils/testHelpers';

test.describe.serial('@carga StartTransaction', () => {
  test('Enviar StartTransaction', async ({ ocppClient }) => {
    await test.step('Enviar BootNotification y Authorize si es necesario', async () => {
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
    });
    
    await test.step('Enviar StartTransaction', async () => {
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
});

test.describe.serial('@carga StopTransaction', () => {
  test('Enviar StopTransaction', async ({ ocppClient }) => {
    await test.step('Enviar BootNotification, Authorize y StartTransaction si es necesario', async () => {
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
    });

    await test.step('Enviar StopTransaction después de 1:30 minutos de carga', async () => {
      setTimeout(async () => {
        console.log('🛑 Enviando StopTransaction...');
        const stopRes = await stopTransaction(ocppClient, {
          transactionId: stateManager.state.transactionId,
          meterStop: testData.stopTransaction.meterStop,
          timestamp: testData.stopTransaction.timestamp
        });
        console.log('<= Respuesta StopTransaction:', stopRes);
      }, 90000); // 1:30 minutos
    });
  });
});
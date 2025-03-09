import { test } from '../fixtures/ocppFixture';
import stateManager from '../utils/stateManager';
import testData from '../data/testData';
import { stopMeterValues } from '../api/utils';
import {
    bootNotification,
    authorize,
    startTransaction,
    stopTransaction,
    heartbeat,
    statusNotification,
    simulateCharging
} from '../utils/testHelpers';
import path from 'path';

const scriptPath = path.join(process.cwd(), 'utils', 'analyzeMeterValues.js');

test.describe.serial('@carga FlujoCompleto', () => {
  test('Flujo entero: BootNotification, StatusNotification, Authorize, StartTransaction, MeterValues, Heartbeat, StopTransaction', async ({ ocppClient }) => {
    /**
     * 1. BootNotification (si no se ha enviado aún)
     */
    if (!stateManager.state.bootNotificationSent) {
      const bootRes = await bootNotification(ocppClient, testData.bootNotification);
      console.log('<= Respuesta BootNotification:', bootRes);
      stateManager.saveState({ bootNotificationSent: true });
    } else {
      console.log('⚠️ BootNotification ya fue enviado. Omitiendo...');
    }

    /**
     * 2. StatusNotification (Available)
     */
    console.log('⚡ Enviando StatusNotification (Available)...');
    const statusRes = await statusNotification(ocppClient, {
      connectorId: testData.startTransaction.connectorId,
      status: "Available",
      errorCode: "NoError"
    });
    console.log('<= Respuesta StatusNotification:', statusRes);

    /**
     * 3. Authorize (si no se ha autorizado aún)
     */
    if (!stateManager.state.authorized) {
      const authRes = await authorize(ocppClient, testData.authorize.idTag);
      console.log('<= Respuesta Authorize:', authRes);
      stateManager.saveState({ authorized: true });
    } else {
      console.log('⚠️ El cargador ya está autorizado. Omitiendo...');
    }

    /**
     * 4. StartTransaction (obtener transactionId real)
     */
    if (!stateManager.state.transactionId) {
      const startRes = await startTransaction(ocppClient, testData.startTransaction);
      console.log('<= Respuesta StartTransaction:', startRes);

      if (startRes?.idTagInfo?.status === "Accepted") {
        stateManager.saveState({ transactionId: startRes.transactionId });
        console.log(`🤝 StartTransaction aceptado. transactionId real: ${startRes.transactionId}`);
      } else {
        throw new Error(`StartTransaction rechazado o inválido: ${JSON.stringify(startRes)}`);
      }
    } else {
      console.log('⚠️ Existe una transacción activa. Omitiendo StartTransaction...');
    }

    /**
     * 5. Simular carga con MeterValues incrementales
     */
    const txId = stateManager.state.transactionId;
    if (!txId) {
      throw new Error('🚨 No hay transactionId para enviar MeterValues.');
    }

    const { intervalSeconds, durationSeconds } = testData.meterValuesConfig;
    const connector = testData.connector;

    // Iniciar el envío de MeterValues
    const meterValuesPromise = simulateCharging(
      ocppClient,
      txId,
      intervalSeconds,
      durationSeconds,
      connector
    );

    /**
     * 6. Enviar Heartbeat después de 1 minuto de carga
     */
    const heartbeatPromise = new Promise((resolve) => {
      setTimeout(async () => {
        console.log('🩺 Enviando Heartbeat...');
        const heartbeatRes = await heartbeat(ocppClient);
        console.log('<= Respuesta Heartbeat:', heartbeatRes);
        resolve();
      }, 60000); // 1 minuto
    });

    /**
     * 7. StopTransaction después de 1:30 minutos de carga
     */
    const stopTransactionPromise = new Promise((resolve) => {
      setTimeout(async () => {
        console.log('🛑 Enviando StopTransaction...');
        const stopRes = await stopTransaction(ocppClient, {
          transactionId: txId,
          meterStop: testData.stopTransaction.meterStop,
          timestamp: testData.stopTransaction.timestamp
        });
        console.log('<= Respuesta StopTransaction:', stopRes);

        // Indicarle a generateAndSendMeterValues que detenga el loop
        stopMeterValues();

        resolve();
      }, 90000); // 1:30 minutos
    });

    // Esperar a que todas las promesas se completen antes de cerrar la conexión
    await Promise.all([meterValuesPromise, heartbeatPromise, stopTransactionPromise]);
  });
});
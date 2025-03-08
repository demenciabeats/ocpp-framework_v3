import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import { waitForResponse } from '../../utils/waitForResponse';
import path from 'path';
import fs from 'fs';

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));
const scriptPath = path.join(process.cwd(), 'utils', 'analyzeMeterValues.js');

test.describe.serial('@carga FlujoCompleto', () => {
  test('Flujo entero: BootNotification, StatusNotification, Authorize, StartTransaction, MeterValues, Heartbeat, StopTransaction', async ({ ocppClient }) => {
    /**
     * 1. BootNotification (si no se ha enviado aún)
     */
    if (!stateManager.state.bootNotificationSent) {
      const bootData = testData.bootNotification;
      const bootReqId = ocppClient.sendBootNotification(
        bootData.vendor,
        bootData.model,
        bootData.serialNumber,
        bootData.chargeBoxSerialNumber,
        bootData.firmwareVersion,
        bootData.iccid,
        bootData.imsi,
        bootData.meterType,
        bootData.meterSerialNumber
      );

      const bootRes = await waitForResponse(ocppClient, bootReqId);
      console.log('<= Respuesta BootNotification:', bootRes);
      stateManager.saveState({ bootNotificationSent: true });
    } else {
      console.log('⚠️ BootNotification ya fue enviado. Omitiendo...');
    }

    /**
     * 2. StatusNotification (Available)
     */
    console.log('⚡ Enviando StatusNotification (Available)...');
    const statusReqId = ocppClient.sendStatusNotification(
      testData.startTransaction.connectorId,
      "Available",
      "NoError"
    );
    await waitForResponse(ocppClient, statusReqId);

    /**
     * 3. Authorize (si no se ha autorizado aún)
     */
    if (!stateManager.state.authorized) {
      const authReqId = ocppClient.sendAuthorize(testData.authorize.idTag);
      const authRes = await waitForResponse(ocppClient, authReqId);
      console.log('<= Respuesta Authorize:', authRes);
      stateManager.saveState({ authorized: true });
    } else {
      console.log('⚠️ El cargador ya está autorizado. Omitiendo...');
    }

    /**
     * 4. StartTransaction (obtener transactionId real)
     */
    if (!stateManager.state.transactionId) {
      const startData = testData.startTransaction;
      const startReqId = ocppClient.sendStartTransaction(
        startData.connectorId,
        startData.idTag,
        startData.meterStart,
        startData.timestamp
      );
      const startRes = await waitForResponse(ocppClient, startReqId);
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
    await ocppClient.generateAndSendMeterValues(
      txId,
      intervalSeconds,
      durationSeconds,
      connector
    );

    /**
     * 6. Enviar Heartbeat después de 1 minuto de carga
     */
    setTimeout(async () => {
      console.log('🩺 Enviando Heartbeat...');
      const heartbeatReqId = ocppClient.sendHeartbeat();
      const heartbeatRes = await waitForResponse(ocppClient, heartbeatReqId);
      console.log('<= Respuesta Heartbeat:', heartbeatRes);
    }, 60000); // 1 minuto

    /**
     * 7. StopTransaction después de 1:30 minutos de carga
     */
    setTimeout(async () => {
      console.log('🛑 Enviando StopTransaction...');
      const stopData = testData.stopTransaction;
      const stopReqId = ocppClient.sendStopTransaction(
        txId,
        stopData.meterStop,
        stopData.timestamp
      );
      const stopRes = await waitForResponse(ocppClient, stopReqId, 10000);
      console.log('<= Respuesta StopTransaction:', stopRes);

      console.log('📊 Ejecutando análisis de MeterValues...');
      execFileSync('node', [scriptPath], { stdio: 'inherit' });
    }, 90000); // 1:30 minutos
  });
});
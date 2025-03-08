import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import { waitForResponse } from '../../utils/waitForResponse';
import path from 'path';
import fs from 'fs';

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));
const scriptPath = path.join(process.cwd(), 'utils', 'analyzeMeterValues.js');

test.describe.serial('@carga FlujoCompleto', () => {
  test('Flujo entero: BootNotification, Authorize, StartTransaction, MeterValues, StopTransaction', async ({ ocppClient }) => {
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
     * 2. Authorize (si no se ha autorizado aún)
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
     * 3. StartTransaction (obtener transactionId real)
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
     * 4. Simular carga con MeterValues incrementales
     */
    const txId = stateManager.state.transactionId;
    if (!txId) {
      throw new Error('🚨 No hay transactionId para enviar MeterValues.');
    }
    for (const meterValue of testData.meterValues) {
      const meterReqId = ocppClient.sendMeterValues(
        txId,
        [meterValue]
      );

      try {
        const mvResp = await waitForResponse(ocppClient, meterReqId);
        console.log(`<= Respuesta MeterValues:`, mvResp);
      } catch {
        console.log(`⚠️ No se recibió respuesta para MeterValues, continuando...`);
      }

      // Espera entre mediciones (por ejemplo, 5 segundos)
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    /**
     * 5. Mantener la conexión con StatusNotification (opcional)
     */
    console.log('⏳ Manteniendo la carga activa y enviando StatusNotification cada 10s...');
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      ocppClient.sendStatusNotification(
        Number(process.env.CONNECTOR_ID),
        "Charging",
        "NoError"
      );
      console.log(`⏱ StatusNotification #${i + 1} enviado`);
    }

    /**
     * 6. StopTransaction
     */
    console.log('🛑 Enviando StopTransaction...');
    const stopData = testData.stopTransaction;
    const stopReqId = ocppClient.sendStopTransaction(
      txId,
      stopData.meterStop,
      stopData.timestamp
    );
    const stopRes = await waitForResponse(ocppClient, stopReqId, 10000);
    console.log('<= Respuesta StopTransaction:', stopRes);
  });
});
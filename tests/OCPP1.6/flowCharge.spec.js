import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import { waitForResponse } from '../../utils/waitForResponse';
import path from 'path';

const scriptPath = path.join(process.cwd(), 'utils', 'analyzeMeterValues.js');

test.describe.serial('@carga FlujoCompleto', () => {
  test('Flujo entero: BootNotification, Authorize, StartTransaction, MeterValues, StopTransaction', async ({ ocppClient }) => {
    /**
     * 1. BootNotification (si no se ha enviado aún)
     */
    if (!stateManager.state.bootNotificationSent) {
      const bootReqId = "123";
      const bootNotification = [
        2, 
        bootReqId,
        "BootNotification",
        {
          "chargePointVendor": "infypower",
          "chargePointModel": "Infi4ever",
          "chargePointSerialNumber": "SN-12345678",
          "chargeBoxSerialNumber": "EV.2S7P04",
          "firmwareVersion": "3.3.0.10",
          "iccid": "8901120000000000000",
          "imsi": "123456789012345",
          "meterType": "DhemaxMeter",
          "meterSerialNumber": "MTR-001"
        }
      ];

      console.log('=> Enviando BootNotification...');
      ocppClient.sendMessage(bootNotification);

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
      const authReqId = "AUTH-1";
      console.log('=> Enviando Authorize...');
      ocppClient.sendMessage([2, authReqId, "Authorize", {
        idTag: process.env.ID_TAG
      }]);
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
      const startReqId = "ST-1";
      console.log('=> Enviando StartTransaction...');
      ocppClient.sendMessage([2, startReqId, "StartTransaction", {
        connectorId: Number(process.env.CONNECTOR_ID),
        idTag: process.env.ID_TAG,
        meterStart: 100,
        timestamp: new Date().toISOString()
      }]);
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
    let meterValueCounter = 100;
    for (let i = 1; i <= 6; i++) {
      meterValueCounter += Math.floor(Math.random() * 50) + 20; // Valor base que se incrementa aleatoriamente
      const meterReqId = `MV-${i}`;
      const meterValuePayload = {
        connectorId: Number(process.env.CONNECTOR_ID),
        transactionId: txId,
        meterValue: [{
          timestamp: new Date().toISOString(),
          sampledValue: [{
            value: `${meterValueCounter}`,
            unit: "Wh",
            measurand: "Energy.Active.Import.Register"
          }]
        }]
      };
      console.log(`=> Enviando MeterValues (${i}):`, meterValuePayload);
      ocppClient.sendMessage([2, meterReqId, "MeterValues", meterValuePayload]);

      try {
        const mvResp = await waitForResponse(ocppClient, meterReqId);
        console.log(`<= Respuesta MeterValues (${i}):`, mvResp);
      } catch {
        console.log(`⚠️ No se recibió respuesta para MeterValues (${i}), continuando...`);
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
      ocppClient.sendMessage([2, `SN-${i}`, "StatusNotification", {
        connectorId: Number(process.env.CONNECTOR_ID),
        status: "Charging",
        errorCode: "NoError",
        timestamp: new Date().toISOString()
      }]);
      console.log(`⏱ StatusNotification #${i + 1} enviado`);
    }

    /**
     * 6. StopTransaction
     */
    console.log('🛑 Enviando StopTransaction...');
    const stopReqId = "STP-1";
    ocppClient.sendMessage([2, stopReqId, "StopTransaction", {
      transactionId: txId,
      meterStop: 300,
      timestamp: new Date().toISOString()
    }]);
    const stopRes = await waitForResponse(ocppClient, stopReqId, 10000);
    console.log('<= Respuesta StopTransaction:', stopRes);
  });
});
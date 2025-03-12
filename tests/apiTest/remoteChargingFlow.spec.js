import { test, expect } from '@playwright/test';
import apiRequest from '../../utils/apiClient';
import apiConfig from '../../api/apiConfig';
import { listenForCentralSystemMessage, sendStartTransaction, sendStatusNotification, sendMeterValues, sendStopTransaction } from '../../api/ocppMessages';

test.describe('Flujo de carga remota', () => {
  test('Carga remota con Start/Stop Transaction', async () => {
    // 1. Tomar la config para RemoteStartTransaction del apiConfig
    const remoteStartConfig = {
      ...apiConfig.remoteStartFull,
      // Sobrescribir parámetros si se requiere
      body: {
        ...apiConfig.remoteStartFull.body
      }
    };
    const remoteStartResponse = await apiRequest(remoteStartConfig);
    expect(remoteStartResponse?.body).toBeDefined();

    // 2. Escuchar el mensaje proveniente del sistema central y capturar transactionId
    const centralMessage = await listenForCentralSystemMessage();
    const transactionId = centralMessage.transactionId;
    expect(transactionId).toBeDefined();

    // 3. Enviar StartTransaction
    const startTxResponse = await sendStartTransaction(transactionId);
    expect(startTxResponse).toBeDefined();

    // 4. Enviar StatusNotification a "Charging"
    const statusResponse = await sendStatusNotification(transactionId, 'Charging');
    expect(statusResponse).toBeDefined();

    // 5. Esperar 30 segundos
    await new Promise(resolve => setTimeout(resolve, 30000));

    // 6. Enviar MeterValues por 2 minutos
    const meterValuesDuration = 2 * 60 * 1000;
    const meterStartTime = Date.now();
    while (Date.now() - meterStartTime < meterValuesDuration) {
      await sendMeterValues(transactionId);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // 7. Tomar la config de RemoteStop y sobreescribir transactionId en el body
    const remoteStopConfig = {
      ...apiConfig.remoteStop,
      body: {
        ...apiConfig.remoteStop.body,
        transactionId
      }
    };
    const remoteStopResponse = await apiRequest(remoteStopConfig);
    expect(remoteStopResponse?.body).toBeDefined();

    // 8. Escuchar respuesta del sistema central y enviar StopTransaction
    const centralStopMessage = await listenForCentralSystemMessage();
    expect(centralStopMessage).toBeDefined();

    const stopTxResponse = await sendStopTransaction(transactionId);
    expect(stopTxResponse).toBeDefined();
  });
});
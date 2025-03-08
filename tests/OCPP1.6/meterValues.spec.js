import { test } from '../../fixtures/ocppFixture';
import { waitForResponse } from '../../utils/waitForResponse';
import stateManager from '../../utils/stateManager';
import fs from 'fs';

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));

test.describe.serial('@carga 📊 Reportar MeterValues', () => {
    test('📊 MeterValues', async ({ ocppClient }) => {
        if (!stateManager.state.transactionId) {
            console.log('🚀 Transacción no activa, iniciando StartTransaction automáticamente...');
            if (!stateManager.state.bootNotificationSent) {
                console.log('📢 BootNotification no enviado, enviando ahora...');
                const bootData = testData.bootNotification;
                const bootUniqueId = ocppClient.sendBootNotification(
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
                await waitForResponse(ocppClient, bootUniqueId);
                stateManager.saveState({ bootNotificationSent: true });
            }
            if (!stateManager.state.authorized) {
                console.log('✅ Authorize no enviado, enviando ahora...');
                const authUniqueId = ocppClient.sendAuthorize(testData.authorize.idTag);
                await waitForResponse(ocppClient, authUniqueId);
                stateManager.saveState({ authorized: true });
            }
            const startData = testData.startTransaction;
            const startUniqueId = ocppClient.sendStartTransaction(
                startData.connectorId,
                startData.idTag,
                startData.meterStart,
                startData.timestamp
            );
            const startResponse = await waitForResponse(ocppClient, startUniqueId);
            stateManager.saveState({ transactionId: startResponse.transactionId });
        }

        for (const meterValue of testData.meterValues) {
            const uniqueId = ocppClient.sendMeterValues(
                stateManager.state.transactionId,
                [meterValue]
            );

            const response = await waitForResponse(ocppClient, uniqueId);
            console.log(`📥 Respuesta MeterValues:`, response);

            // Se reduce el tiempo de espera para pruebas
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    });
});

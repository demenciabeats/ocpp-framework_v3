import { test } from '../../fixtures/ocppFixture';
import { waitForResponse } from '../../utils/waitForResponse';
import stateManager from '../../utils/stateManager';

test.describe.serial('@carga 📊 Reportar MeterValues', () => {
    test('📊 MeterValues', async ({ ocppClient }) => {
        if (!stateManager.state.transactionId) {
            console.log('🚀 Transacción no activa, iniciando StartTransaction automáticamente...');
            if (!stateManager.state.bootNotificationSent) {
                console.log('📢 BootNotification no enviado, enviando ahora...');
                const bootUniqueId = ocppClient.sendBootNotification(
                    "Dhemax",
                    "Model-X",
                    "SN-12345678",
                    "EV.2S7P04",
                    "3.3.0.10",
                    "8901120000000000000",
                    "123456789012345",
                    "DhemaxMeter",
                    "MTR-001"
                );
                await waitForResponse(ocppClient, bootUniqueId);
                stateManager.saveState({ bootNotificationSent: true });
            }
            if (!stateManager.state.authorized) {
                console.log('✅ Authorize no enviado, enviando ahora...');
                const authUniqueId = ocppClient.sendAuthorize(process.env.ID_TAG);
                await waitForResponse(ocppClient, authUniqueId);
                stateManager.saveState({ authorized: true });
            }
            const startUniqueId = ocppClient.sendStartTransaction(
                Number(process.env.CONNECTOR_ID),
                process.env.ID_TAG,
                100,
                new Date().toISOString()
            );
            const startResponse = await waitForResponse(ocppClient, startUniqueId);
            stateManager.saveState({ transactionId: startResponse.transactionId });
        }

        for (let i = 1; i <= 3; i++) {
            const uniqueId = ocppClient.sendMeterValues(
                stateManager.state.transactionId,
                [{
                    timestamp: new Date().toISOString(),
                    sampledValue: [{
                        value: `${100 + i * 50}`,
                        unit: "Wh",
                        measurand: "Energy.Active.Import.Register"
                    }]
                }]
            );

            const response = await waitForResponse(ocppClient, uniqueId);
            console.log(`📥 Respuesta MeterValues (${i}):`, response);

            // Se reduce el tiempo de espera para pruebas
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    });
});

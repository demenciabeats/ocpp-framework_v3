import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';

test.describe.serial('@carga 📊 Reportar MeterValues', () => {
    test('📊 MeterValues', async ({ ocppClient }) => {
        if (!stateManager.state.transactionId) {
            console.log('🚀 Transacción no activa, iniciando StartTransaction automáticamente...');
            if (!stateManager.state.bootNotificationSent) {
                console.log('📢 BootNotification no enviado, enviando ahora...');
                ocppClient.sendMessage([2, "001", "BootNotification", {
                    chargePointVendor: "Dhemax",
                    chargePointModel: "Model-X"
                }]);
                stateManager.saveState({ bootNotificationSent: true });
            }
            if (!stateManager.state.authorized) {
                console.log('✅ Authorize no enviado, enviando ahora...');
                ocppClient.sendMessage([2, "002", "Authorize", {
                    idTag: process.env.ID_TAG
                }]);
                stateManager.saveState({ authorized: true });
            }
            const transactionId = "003"; 
            ocppClient.sendMessage([2, "003", "StartTransaction", {
                connectorId: Number(process.env.CONNECTOR_ID),
                idTag: process.env.ID_TAG,
                meterStart: 100,
                timestamp: new Date().toISOString()
            }]);
            stateManager.saveState({ transactionId });
        }

        for (let i = 1; i <= 3; i++) { 
            ocppClient.sendMessage([2, `004-${i}`, "MeterValues", {
                transactionId: stateManager.state.transactionId,
                meterValue: [{
                    timestamp: new Date().toISOString(),
                    sampledValue: [{
                        value: `${100 + i * 50}`,
                        unit: "Wh",
                        measurand: "Energy.Active.Import.Register"
                    }]
                }]
            }]);

            // Se reduce el tiempo de espera para pruebas
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    });
});

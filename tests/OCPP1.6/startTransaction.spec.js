import { test } from '../../fixtures/ocppFixture';
import { waitForResponse } from '../../utils/waitForResponse';
import stateManager from '../../utils/stateManager';
import fs from 'fs';

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));

test.describe.serial('@carga ⚡ Iniciar StartTransaction', () => {
    test('⚡ StartTransaction', async ({ ocppClient }) => {
        if (!stateManager.state.bootNotificationSent) {
            throw new Error('🚨 No se puede iniciar la transacción sin BootNotification.');
        }

        if (!stateManager.state.authorized) {
            throw new Error('🚨 No se puede iniciar la transacción sin Authorize.');
        }

        const startData = testData.startTransaction;
        const uniqueId = ocppClient.sendStartTransaction(
            startData.connectorId,
            startData.idTag,
            startData.meterStart,
            startData.timestamp
        );

        const response = await waitForResponse(ocppClient, uniqueId);
        console.log("📥 Respuesta StartTransaction:", response);

        if (response.idTagInfo && response.idTagInfo.status === "Accepted") {
            const realTransactionId = response.transactionId;
            console.log(`🤝 StartTransaction aceptado con transactionId: ${realTransactionId}`);
            stateManager.saveState({ transactionId: realTransactionId });
        } else {
            console.log("⚠️ StartTransaction rechazado o con estado desconocido:", response);
        }
    });
});

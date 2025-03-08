import { test } from '../../fixtures/ocppFixture';
import { waitForResponse } from '../../utils/waitForResponse';
import stateManager from '../../utils/stateManager';

test.describe.serial('@carga 🩺 Enviar Heartbeat', () => {
    test('🩺 Heartbeat', { timeout: 7000 }, async ({ ocppClient }) => {
        for (let i = 1; i <= 5; i++) {
            const uniqueId = ocppClient.sendHeartbeat();
            const response = await waitForResponse(ocppClient, uniqueId);
            console.log(`📥 Respuesta Heartbeat (${i}):`, response);
            console.log(`🩺 Heartbeat enviado (${i})`);
            // Se reduce el delay para evitar tiempo de espera excesivo
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    });
});

test.describe.serial('@carga ⚡ Iniciar StartTransaction', () => {
    test('⚡ StartTransaction', async ({ ocppClient }) => {
        if (!stateManager.state.bootNotificationSent) {
            throw new Error('🚨 No se puede iniciar la transacción sin BootNotification.');
        }
        await new Promise(resolve => setTimeout(resolve, 5000));

        if (!stateManager.state.authorized) {
            throw new Error('🚨 No se puede iniciar la transacción sin Authorize.');
        }
        const uniqueId = ocppClient.sendStartTransaction(
            Number(process.env.CONNECTOR_ID),
            process.env.ID_TAG,
            100,
            new Date().toISOString()
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
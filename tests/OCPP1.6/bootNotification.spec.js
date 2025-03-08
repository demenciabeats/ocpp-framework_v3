import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import { waitForResponse } from '../../utils/waitForResponse';

test.describe.serial('@carga 📢 Enviar BootNotification', () => {
    test('📢 BootNotification', async ({ ocppClient }) => {
        if (stateManager.state.bootNotificationSent) {
            console.log('⚠️ BootNotification ya fue enviado. Omitiendo...');
            return;
        }

        const uniqueId = ocppClient.sendBootNotification(
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

        const response = await waitForResponse(ocppClient, uniqueId);
        console.log('<= Respuesta BootNotification:', response);

        if (response.status === "Accepted") {
            stateManager.saveState({ bootNotificationSent: true });
        } else {
            console.log('BootNotification rechazado o no Accepted:', response);
        }
    });
});

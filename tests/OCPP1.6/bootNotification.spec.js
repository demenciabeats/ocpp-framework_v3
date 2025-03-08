import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import { waitForResponse } from '../../utils/waitForResponse';

test.describe.serial('@carga 📢 Enviar BootNotification', () => {
    test('📢 BootNotification', async ({ ocppClient }) => {
        if (stateManager.state.bootNotificationSent) {
            console.log('⚠️ BootNotification ya fue enviado. Omitiendo...');
            return;
        }

        const uniqueId = "001";
        ocppClient.sendMessage([2, uniqueId, "BootNotification", {
            chargePointVendor: "Dhemax",
            chargePointModel: "Model-X"
        }]);

        const response = await waitForResponse(ocppClient, uniqueId);
        console.log('<= Respuesta BootNotification:', response);

        if (response.status === "Accepted") {
            stateManager.saveState({ bootNotificationSent: true });
        } else {
            console.log('BootNotification rechazado o no Accepted:', response);
        }
    });
});

import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import { waitForResponse } from '../../utils/waitForResponse';

test.describe.serial('@carga ✅ Enviar Authorize', () => {
    test('✅ Authorize', async ({ ocppClient }) => {
        if (!stateManager.state.bootNotificationSent) {
            console.log('📢 BootNotification no enviado, enviando ahora...');
            ocppClient.sendMessage([2, "001", "BootNotification", {
                chargePointVendor: "Dhemax",
                chargePointModel: "Model-X"
            }]);
            stateManager.saveState({ bootNotificationSent: true });
        }

        const authReqId = "002";
        ocppClient.sendMessage([2, authReqId, "Authorize", {
            idTag: process.env.ID_TAG
        }]);

        // Esperar la respuesta “Authorize” antes de marcar authorized
        const authRes = await waitForResponse(ocppClient, authReqId);
        console.log('<= Respuesta Authorize:', authRes);

        if (authRes?.idTagInfo?.status === "Accepted") {
            stateManager.saveState({ authorized: true });
        } else {
            console.log('Authorize rechazado o no Accepted:', authRes);
        }
    });
});

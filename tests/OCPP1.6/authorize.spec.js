import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import { waitForResponse } from '../../utils/waitForResponse';

test.describe.serial('@carga ✅ Enviar Authorize', () => {
    test('✅ Authorize', async ({ ocppClient }) => {
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

        const authReqId = ocppClient.sendAuthorize(process.env.ID_TAG);

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

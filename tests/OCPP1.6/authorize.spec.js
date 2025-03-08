import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import { waitForResponse } from '../../utils/waitForResponse';
import fs from 'fs';

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));

test.describe.serial('@carga ✅ Enviar Authorize', () => {
    test('✅ Authorize', async ({ ocppClient }) => {
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

        const authReqId = ocppClient.sendAuthorize(testData.authorize.idTag);

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

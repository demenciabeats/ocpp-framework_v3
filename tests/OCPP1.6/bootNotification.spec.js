import { test } from '../../fixtures/ocppFixture';
import stateManager from '../../utils/stateManager';
import { waitForResponse } from '../../utils/waitForResponse';
import fs from 'fs';

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));

test.describe.serial('@carga 📢 Enviar BootNotification', () => {
    test('📢 BootNotification', async ({ ocppClient }) => {
        if (stateManager.state.bootNotificationSent) {
            console.log('⚠️ BootNotification ya fue enviado. Omitiendo...');
            return;
        }

        const bootData = testData.bootNotification;
        const uniqueId = ocppClient.sendBootNotification(
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

        const response = await waitForResponse(ocppClient, uniqueId);
        console.log('<= Respuesta BootNotification:', response);

        if (response.status === "Accepted") {
            stateManager.saveState({ bootNotificationSent: true });
        } else {
            console.log('BootNotification rechazado o no Accepted:', response);
        }
    });
});

import { test, expect } from '../../fixtures/ocppFixture';
import { waitForResponse } from '../../utils/waitForResponse';
import fs from 'fs';

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));

test.describe('Ejemplo de Test OCPP con Fixture', () => {
    test('Enviar BootNotification y manejar respuesta', async ({ ocppClient }) => {
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
        console.log("📥 Respuesta recibida:", response);

        // Validar la respuesta
        expect(response.status).toBe("Accepted");
    });
});
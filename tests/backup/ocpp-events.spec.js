import { test, expect } from '@playwright/test';
import OcppClient from '../../api/ocppClient';
import { waitForResponse } from '../../utils/waitForResponse';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));

test.describe('🔌 Conexión al WebSocket OCPP 1.6 y envío de BootNotification', () => {
    let ocppClient;

    test.beforeAll(async () => {
        ocppClient = new OcppClient(process.env.WS_URL, process.env.CHARGE_POINT_ID);
        await ocppClient.connect();
    });

    test('🔄 BootNotification con validación de respuesta', async () => {
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

        // Validamos que el status sea "Accepted"
        expect(response.status).toBe("Accepted");
        console.log("✅ BootNotification aceptado con éxito.");
    });

    test.afterAll(async () => {
        ocppClient.close();
    });
});

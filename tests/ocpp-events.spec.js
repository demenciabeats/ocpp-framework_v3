import { test, expect } from '@playwright/test';
import OcppClient from '../api/ocppClient';
import { waitForResponse } from '../utils/waitForResponse';
import dotenv from 'dotenv';

dotenv.config();

test.describe('🔌 Conexión al WebSocket OCPP 1.6 y envío de BootNotification', () => {
    let ocppClient;

    test.beforeAll(async () => {
        ocppClient = new OcppClient(process.env.WS_URL, process.env.CHARGE_POINT_ID);
        await ocppClient.connect();
    });

    test('🔄 BootNotification con validación de respuesta', async () => {
        const uniqueId = "1234";
        const bootNotification = [
            2, 
            uniqueId, 
            "BootNotification",
            {
                "chargePointVendor": "infypower",
                "chargePointModel": "Infi4ever",
                "chargePointSerialNumber": "SN-12345678",
                "chargeBoxSerialNumber": "EV.2S7P04",
                "firmwareVersion": "3.3.0.10",
                "iccid": "8901120000000000000",
                "imsi": "123456789012345",
                "meterType": "DhemaxMeter",
                "meterSerialNumber": "MTR-001"
            }
        ];

        console.log("📤 Enviando BootNotification:", JSON.stringify(bootNotification));
        ocppClient.sendMessage(bootNotification);

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

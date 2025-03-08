import { test, expect } from '@playwright/test';
import { waitForResponse } from '../../utils/waitForResponse';
import dotenv from 'dotenv';

dotenv.config();

test.describe('🔌 Conexión al WebSocket OCPP 1.6 y envío de BootNotification', () => {
    let ocppClient;

    test.beforeAll(async () => {
        ocppClient = new OcppClient(process.env.WS_URL, process.env.CHARGE_POINT_ID);
        await ocppClient.connect();
    });

    test('🔄 BootNotification con validación de respuesta', async () => {
        const uniqueId = ocppClient.sendBootNotification(
            "infypower",
            "Infi4ever",
            "SN-12345678",
            "EV.2S7P04",
            "3.3.0.10",
            "8901120000000000000",
            "123456789012345",
            "DhemaxMeter",
            "MTR-001"
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

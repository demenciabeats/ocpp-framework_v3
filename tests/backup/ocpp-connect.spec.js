import { test, expect } from '@playwright/test';
import OcppClient from '../../api/ocppClient';
import { waitForResponse } from '../../utils/waitForResponse';
import dotenv from 'dotenv';

dotenv.config();

test.describe('🔌 Conexión al WebSocket OCPP 1.6 y envío de BootNotification + Heartbeat', () => {
    let ocppClient;
    let heartbeatInterval = 25; // Valor por defecto (puede cambiar según la respuesta del servidor)

    test('✅ Conectar al WebSocket, enviar BootNotification y Heartbeat', async () => {
        // 1️⃣ Conectar al WebSocket
        ocppClient = new OcppClient(process.env.WS_URL, process.env.CHARGE_POINT_ID);
        await ocppClient.connect();
        await new Promise(resolve => setTimeout(resolve, 3000)); // Esperar 3 segundos

        // 2️⃣ Enviar BootNotification
        console.log("⚡ Enviando BootNotification...");

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

        const bootResponse = await waitForResponse(ocppClient, uniqueId);

        // 3️⃣ Validar la respuesta del servidor
        console.log("📥 Respuesta recibida:", bootResponse);
        expect(bootResponse.status).toBe("Accepted");
        console.log("✅ BootNotification aceptado con éxito.");

        // 4️⃣ Extraer el intervalo del servidor para Heartbeat
        if (bootResponse.interval) {
            heartbeatInterval = bootResponse.interval;
        }
        console.log(`⏳ Intervalo de Heartbeat definido en ${heartbeatInterval} segundos.`);

        // 5️⃣ Enviar Heartbeat automáticamente después del intervalo indicado
        await new Promise(resolve => setTimeout(resolve, heartbeatInterval * 1000));
        console.log("⚡ Enviando Heartbeat...");

        const heartbeatUniqueId = ocppClient.sendHeartbeat();
        const heartbeatResponse = await waitForResponse(ocppClient, heartbeatUniqueId);

        console.log("📥 Respuesta al Heartbeat:", heartbeatResponse);
        expect(heartbeatResponse.currentTime).toBeDefined();
        console.log("✅ Heartbeat enviado y recibido correctamente.");
    });

    test.afterAll(async () => {
        ocppClient.close();
    });
});

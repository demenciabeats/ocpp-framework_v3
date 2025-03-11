import { test, expect } from '@playwright/test';
import OcppClient from '../../api/ocppClient';
import { waitForResponse } from '../../utils/waitForResponse';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));

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

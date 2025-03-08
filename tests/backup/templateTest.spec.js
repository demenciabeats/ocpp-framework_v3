import { test, expect } from '@playwright/test';
import OcppClient from '../../api/ocppClient';
import { waitForResponse } from '../../utils/waitForResponse';
import dotenv from 'dotenv';

dotenv.config();

test.describe('Template de Test OCPP', () => {
  let ocppClient;

  test.beforeAll(async () => {
    ocppClient = new OcppClient(process.env.WS_URL, process.env.CHARGE_POINT_ID);
    await ocppClient.connect();
  });

  test('Ejemplo de Test con waitForResponse', async () => {
    const uniqueId = "001";
    const message = [2, uniqueId, "BootNotification", {
      chargePointVendor: "Dhemax",
      chargePointModel: "Model-X"
    }];

    console.log("📤 Enviando BootNotification:", JSON.stringify(message));
    ocppClient.sendMessage(message);

    const response = await waitForResponse(ocppClient, uniqueId);
    console.log("📥 Respuesta recibida:", response);

    // Parsear y validar la respuesta del BootNotification
    expect(response.status).toBe("Accepted");
    expect(response.currentTime).toBeDefined();
    expect(response.interval).toBeDefined();

    console.log("✅ BootNotification aceptado con éxito.");
    console.log("🕒 Hora actual del servidor:", response.currentTime);
    console.log("⏳ Intervalo de Heartbeat:", response.interval);
  });

  test.afterAll(async () => {
    ocppClient.close();
  });
});
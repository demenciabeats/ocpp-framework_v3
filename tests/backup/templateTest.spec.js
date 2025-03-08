import { test, expect } from '@playwright/test';
import OcppClient from '../../api/ocppClient';
import { waitForResponse } from '../../utils/waitForResponse';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const testData = JSON.parse(fs.readFileSync('./data/testData.json', 'utf-8'));

test.describe('Template de Test OCPP', () => {
  let ocppClient;

  test.beforeAll(async () => {
    ocppClient = new OcppClient(process.env.WS_URL, process.env.CHARGE_POINT_ID);
    await ocppClient.connect();
  });

  test('Ejemplo de Test con waitForResponse', async () => {
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

    console.log("📤 Enviando BootNotification:", JSON.stringify(bootData));
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
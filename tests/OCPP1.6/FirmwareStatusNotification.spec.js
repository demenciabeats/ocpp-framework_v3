import { test, expect } from '@playwright/test';
import { sendFirmwareStatusNotification } from '../../api/ocppMessages';
import { waitForResponse } from '../../utils/waitForResponse';

test('FirmwareStatusNotification: enviar y recibir respuesta', async () => {
  // Creamos un objeto ocppClient "mock" con socket simulado
  const ocppClient = {
    socket: {
      on: (event, handler) => { ocppClient._handler = handler; },
      off: (event, handler) => { ocppClient._handler = null; },
      send: (msg) => {
        console.log("Mock send:", msg);
        const parsed = JSON.parse(msg);
        const requestId = parsed[1];
        // Simular respuesta de FirmwareStatusNotification
        const response = [3, requestId, { currentTime: new Date().toISOString(), status: "Accepted" }];
        setTimeout(() => {
          ocppClient._handler && ocppClient._handler(JSON.stringify(response));
        }, 100);
      }
    }
  };

  const reqId = sendFirmwareStatusNotification(ocppClient, { firmwareVersion: "1.0.0" });
  const response = await waitForResponse(ocppClient, reqId, 5000);
  expect(response).toBeDefined();
  expect(response.status).toBe("Accepted");
});

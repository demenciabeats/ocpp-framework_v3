import { test, expect } from '@playwright/test';
import { sendUpdateFirmware } from '../../api/ocppMessages';
import { waitForResponse } from '../../utils/waitForResponse';

test('UpdateFirmware: enviar y recibir respuesta', async () => {
  const ocppClient = {
    socket: {
      on: (event, handler) => { ocppClient._handler = handler; },
      off: (event, handler) => { ocppClient._handler = null; },
      send: (msg) => {
         console.log("Mock send:", msg);
         const parsed = JSON.parse(msg);
         const requestId = parsed[1];
         // Simular respuesta para UpdateFirmware
         const response = [3, requestId, { updateStatus: "Scheduled", currentTime: new Date().toISOString() }];
         setTimeout(() => {
           ocppClient._handler && ocppClient._handler(JSON.stringify(response));
         }, 100);
      }
    }
  };

  const reqId = sendUpdateFirmware(ocppClient, {
    location: "http://firmware.updates.com/firmware.bin",
    retries: 3,
    retrieveDate: new Date().toISOString(),
    retryInterval: 60
  });
  const response = await waitForResponse(ocppClient, reqId, 5000);
  expect(response).toBeDefined();
  expect(response.updateStatus).toBe("Scheduled");
});

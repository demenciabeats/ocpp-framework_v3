import { test, expect } from '@playwright/test';
import { sendDiagnosticsStatusNotification } from '../../api/ocppMessages';
import { waitForResponse } from '../../utils/waitForResponse';

test('DiagnosticsStatusNotification: enviar y recibir respuesta', async () => {
  const ocppClient = {
    socket: {
      on: (event, handler) => { ocppClient._handler = handler; },
      off: (event, handler) => { ocppClient._handler = null; },
      send: (msg) => {
         console.log("Mock send:", msg);
         const parsed = JSON.parse(msg);
         const requestId = parsed[1];
         // Simular respuesta para DiagnosticsStatusNotification
         const response = [3, requestId, { diagnosticsStatus: "Uploaded", currentTime: new Date().toISOString() }];
         setTimeout(() => {
           ocppClient._handler && ocppClient._handler(JSON.stringify(response));
         }, 100);
      }
    }
  };

  const reqId = sendDiagnosticsStatusNotification(ocppClient, { status: "Uploaded" });
  const response = await waitForResponse(ocppClient, reqId, 5000);
  expect(response).toBeDefined();
  expect(response.diagnosticsStatus).toBe("Uploaded");
});

import { test, expect } from '@playwright/test';
import { sendGetDiagnostics } from '../../api/ocppMessages';
import { waitForResponse } from '../../utils/waitForResponse';

test('GetDiagnostics: enviar y recibir respuesta', async () => {
  const ocppClient = {
    socket: {
      on: (event, handler) => { ocppClient._handler = handler; },
      off: (event, handler) => { ocppClient._handler = null; },
      send: (msg) => {
         console.log("Mock send:", msg);
         const parsed = JSON.parse(msg);
         const requestId = parsed[1];
         // Simular una respuesta de GetDiagnostics
         const response = [3, requestId, { diagnostics: "Completed", currentTime: new Date().toISOString() }];
         setTimeout(() => {
           ocppClient._handler && ocppClient._handler(JSON.stringify(response));
         }, 100);
      }
    }
  };

  const reqId = sendGetDiagnostics(ocppClient, {
    location: "server/logs",
    retries: 3,
    retryInterval: 60,
    startTime: new Date().toISOString(),
    stopTime: new Date().toISOString()
  });
  const response = await waitForResponse(ocppClient, reqId, 5000);
  expect(response).toBeDefined();
  expect(response.diagnostics).toBe("Completed");
});

import { test } from '../../fixtures/ocppFixture';
import { expect } from '@playwright/test';
import { bootNotification, authorize, heartbeat } from '../../utils/testHelpers';
import stateManager from '../../utils/stateManager';
import testData from '../../data/testData';

test.describe.serial('@carga Heartbeat', () => {
  test('Enviar Heartbeat inmediatamente después de Authorize', async ({ ocppClient }) => {
    await test.step('Preparar el estado con BootNotification', async () => {
      if (!stateManager.state.bootNotificationSent) {
        const bootRes = await bootNotification(ocppClient, testData.bootNotification);
        console.log('<= Respuesta BootNotification:', bootRes);
        stateManager.saveState({ bootNotificationSent: true });
      }
    });

    await test.step('Enviar Authorize y luego Heartbeat', async () => {
      console.log('🔑 Enviando Authorize...');
      const authRes = await authorize(ocppClient, testData.authorize.idTag);
      console.log('<= Respuesta Authorize:', authRes);
      expect(authRes).toBeDefined();
      stateManager.saveState({ authorized: true });

      console.log('🩺 Enviando Heartbeat...');
      const heartbeatRes = await heartbeat(ocppClient);
      console.log('<= Respuesta Heartbeat:', heartbeatRes);
      expect(heartbeatRes).toBeDefined();
    });
  });
});

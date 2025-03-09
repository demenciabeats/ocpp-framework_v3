import { test } from '../fixtures/ocppFixture';
import stateManager from '../utils/stateManager';
import testData from '../data/testData';
import { bootNotification, authorize } from '../utils/testHelpers';

test.describe.serial('@carga Authorize', () => {
  test('Enviar Authorize', async ({ ocppClient }) => {
    await test.step('Verificar y enviar BootNotification si es necesario', async () => {
      if (!stateManager.state.bootNotificationSent) {
        const bootRes = await bootNotification(ocppClient, testData.bootNotification);
        console.log('<= Respuesta BootNotification:', bootRes);
        stateManager.saveState({ bootNotificationSent: true });
      } else {
        console.log('⚠️ BootNotification ya fue enviado. Omitiendo...');
      }
    });

    await test.step('Enviar Authorize', async () => {
      const authRes = await authorize(ocppClient, testData.authorize.idTag);
      console.log('<= Respuesta Authorize:', authRes);
      stateManager.saveState({ authorized: true });
    });
  });
});